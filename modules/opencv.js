const { Subject } = require('rxjs');
const cv = require('opencv4nodejs');

function Init(options){
    let passOptions = options;
    passOptions.cv = cv;
    camera = new Camera();
    return camera.init(passOptions);
}

function StartCapture() {
    camera.run();
}

function UpdateCamera(options) {
    camera.updateSettings(options);
}

function GetSettings(socket) {
    let tmp = {
        preview: camera.preview
    };
    socket.emit('settings', tmp);
}

function StopCapture() {
    camera.stop();
}

function Camera() {
    this.subject;
    this.vCap;
    this.stopCamera = false;
    this.time = {
        now: 0,
        last: 0,
        deltaTime: 0
    };
    this.cv;
    this.stopInit = false;
    this.interval;
    this.errors = [];
    this.points = {};
    this.preview = 'mask';
    
    this.getSettings = (socket) => {
        let tmp = {
            preview: this.preview
        };
        socket.emit('settings', tmp);
    }

    this.init = (options) => {
        let keys = ['cv'];
        Object.keys(options).forEach((key)=>{this[key] = options[key];});
        keys.forEach((key)=>{
            if(Object.keys(options).indexOf(key) < 0){
                console.error('Missing required options: '+key);
                this.stopInit = true;
            }
        });
        if(!this.stopInit){
            this.stopCamera = false;
            this.subject = new Subject();
            try {
                this.vCap = new this.cv.VideoCapture(0);
                this.rangeLower = new cv.Vec(0, 200, 0);
                this.rangeUpper = new cv.Vec(255, 255, 255);
            } catch (err){
                this.errors.push({
                    error: err,
                    message: "Failed to open capture: Port 0"
                });
            }
            return this.subject;
        }
    }

    this.updateSettings = (options) => {
        Object.keys(options).forEach((key)=>{this[key] = options[key];});
    }

    this.run = () => {
        if(this.errors.length > 0){
            this.subject.next(this.errors.shift());
        }
        this.interval = setInterval(() => {
            let returnData;
            this.time.now = new Date().getTime();
            if(!this.stopCamera){
                returnData = {
                    fps: 0,
                    size: {
                        x: 640,
                        y: 480
                    },
                    points: {}
                }
                let frame;
                if(this.vCap) frame = this.vCap.read();
                if(frame){
                    returnData.size = { x: frame.cols, y: frame.rows };
                    
                    // pull points from frame
                    // let thresh = this.cv.threshold(bFrame, 127,255,0);
                    // returnData.contours = this.cv.findContours(thresh, this.cv.RETR_TREE, this.cv.CHAIN_APPROX_SIMPLE);

                    if(this.send_frame){
                        let blurred = frame.blur(new this.cv.Size(11,11));
                        let hsl = blurred.cvtColor(this.cv.COLOR_BGR2HLS);
                        let range = hsl.inRange(this.rangeLower, this.rangeUpper);
                        //let mask = range.erode(this.cv.getStructuringElement(this.cv.MORPH_ELLIPSE, new this.cv.Size(4, 4)), new cv.Point(-1, -1), 2)
                        let mask = range.dilate(this.cv.getStructuringElement(this.cv.MORPH_ELLIPSE, new this.cv.Size(4, 4)), new cv.Point(-1, -1), 3);
                        let cnts = mask.findContours(this.cv.RETR_EXTERNAL, this.cv.CHAIN_APPROX_SIMPLE);
                        let selectFrames = {
                            'raw': frame,
                            'mask': mask
                        }
                        if(cnts.length > 0){
                            let newPoints = { };
                            cnts.forEach((c)=>{
                                let point = c.minEnclosingCircle();
                                if(point.radius > 10){
                                    let trackKeys = Object.keys(this.points);
                                    if(trackKeys.length > 0){
                                        // adjust tracking points
                                        let pointTracked = false;
                                        trackKeys.forEach((key, index)=>{
                                            trackPoint = this.points[key];
                                            let x = trackPoint.center.x - point.center.x;
                                            let y = trackPoint.center.y - point.center.y;
                                            if(Math.hypot(x,y) < 50){
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
                                    
                                    //returnData.points.push(circ);
                                }
                            })
                            returnData.points = this.points = newPoints;
                        }
                        if(this.preview && this.preview != 'none'){
                            this.cv.imshow('Preview', selectFrames[this.preview]);
                        }else{
                            this.cv.destroyAllWindows();
                        }
                    }
                }
                // finish time calc
                this.time.deltaTime = this.time.now - this.time.last;
                this.time.last = this.time.now;
                returnData.fps = 1000 / this.time.deltaTime;
                
            }else{
                returnData = {
                    noFrame: true
                }
                clearInterval(this.interval);
            }
            this.subject.next(returnData);
        },0)
    }

    this.stop = () => {
        this.stopCamera = true;
        delete this.simPoints;
        delete this.simulatePoints;
    }
}

//module.exports = new Camera();

module.exports.init = Init;
module.exports.startCapture = StartCapture;
module.exports.stopCapture = StopCapture;
module.exports.updateCamera = UpdateCamera;
module.exports.getSettings = GetSettings;