var electron = require('electron');
var { ipcRenderer, remote } = electron;
var cv = remote.require('opencv4nodejs');

var interval;
var vCap;
var calibrated = false;
var calibrating = false;
var calibration_points = [];
var stopCamera = false
var time = { now: 0, last: 0, deltaTime: 0 };
var errors = [];
var points = {};
var rangeLower;
var rangeUpper;
var settings = {
    preview: 'mask',
    lowerHSL: {h: 0, l: 100, s: 0},
    upperHSL: {h: 255,l: 255,s: 255},
}

// IPC START

ipcRenderer.on('init', init);

ipcRenderer.on('update-settings', (e, data)=>{updateSettings(data);});

ipcRenderer.on('stop', ()=>{
    stopCamera = true;
});

ipcRenderer.on('calibrate', (e, data)=>{
    if(data.action){

    }
})

// IPC END

function init (e, options) {
    console.log(options);
    if(options){
        settings = options.settings
        calibrated = options.calibrated;
        calibration_points = options.calibration_points;
    }
    stopCamera = false;
    try {
        vCap = new cv.VideoCapture(0);
        console.log('width', vCap.set(cv.CAP_PROP_FRAME_WIDTH, 640));
        console.log('height',vCap.set(cv.CAP_PROP_FRAME_HEIGHT, 720));
        rangeLower = new cv.Vec(settings.lowerHSL.h, settings.lowerHSL.l, settings.lowerHSL.s);
        rangeUpper = new cv.Vec(settings.upperHSL.h, settings.upperHSL.l, settings.upperHSL.s);
    } catch (err){
        errors.push({
            error: err,
            message: "Failed to open capture: Port 0"
        });
    }
    updateSettings(settings);
    run();
}

function updateSettings (options) {
    Object.keys(options).forEach((key)=>{
        switch(key){
            case 'rangeLower':
                settings.lowerHSL = options[key];
                rangeLower = new cv.Vec(options[key].h, options[key].l, options[key].s); 
                break;
            case 'rangeUpper':
                settings.upperHSL = options[key];
                rangeUpper = new cv.Vec(options[key].h, options[key].l, options[key].s);
                break;
            default:
                settings[key] = options[key];
                break;
        }
    });
}


function run () {
    if(errors.length > 0){
        // this.subject.next(this.errors.shift());
    }
    interval = setInterval(() => {
        let returnData = {
            fps: 0,
            size: {
                x: 640,
                y: 480
            },
            points: {}
        };
        time.now = new Date().getTime();

        // check if stop camera called
        if(!stopCamera){
            let frame;
            if(vCap) frame = vCap.read();
            if(frame){
                returnData.size = { x: frame.cols, y: frame.rows };
                returnData.points = getPoints(frame);
                if(!calibrated){

                }
            }
            // finish time calc
            time.deltaTime = time.now - time.last;
            time.last = time.now;
            returnData.fps = 1000 / time.deltaTime;
            
        }else{
            returnData = {
                noFrame: true
            }
            clearInterval(interval);
        }
        if(!stopCamera) {
            ipcRenderer.send('frame-data', returnData);
        }
    },0)
}

function getPoints(frame){
    // transform frame when calibrated

    // pull points from frame
    let blurred = frame.blur(new cv.Size(11,11));
    // will want to increase contrast on blurred frame
    let hsl = blurred.cvtColor(cv.COLOR_BGR2HLS);
    let range = hsl.inRange(rangeLower, rangeUpper);
    let mask = range.dilate(cv.getStructuringElement(cv.MORPH_ELLIPSE, new cv.Size(4, 4)), new cv.Point(-1, -1), 3);
    let cnts = mask.findContours(cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);
    
    // show preview
    let selectFrames = {
        'blurred': blurred,
        'raw': frame,
        'mask': mask
    }
    if(settings.preview && settings.preview != 'none'){
        cv.imshow('Preview', selectFrames[settings.preview]);
    }else{
        cv.destroyAllWindows();
    }

    // get points from processed frame
    if(cnts.length > 0){
        let newPoints = { };
        cnts.forEach((c)=>{
            let point = c.minEnclosingCircle();
            if(point.radius > 2){

                let trackKeys = Object.keys(points);
                if(trackKeys.length > 0){
                    // adjust tracking points
                    let pointTracked = false;
                    trackKeys.forEach((key, index)=>{
                        trackPoint = points[key];
                        let x = trackPoint.center.x - point.center.x;
                        let y = trackPoint.center.y - point.center.y;
                        if(Math.hypot(x,y) < 60){
                            newPoints[key] = point;
                            pointTracked = true;
                        }
                        if(trackKeys.length - 1 == index && !pointTracked){
                            let id = Math.random().toString(36).substr(2, 9);
                            newPoints[id] = point;
                        }
                    })
                }else{
                    // add new tracking points
                    let id = Math.random().toString(36).substr(2, 9);
                    newPoints[id] = point;
                }

            }
        });
        points = newPoints;
        return newPoints;
    }else{
        return {};
    }
}