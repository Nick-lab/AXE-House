const { Subject } = require('rxjs');
const cv = require('opencv4nodejs');
var camera;

function Init(options){
    let passOptions = options;
    passOptions.cv = cv;
    camera = new Camera();
    return camera.init(passOptions);
}

function StartCapture() {
    camera.run();
}

function StopCapture(){
    camera.stop();
}

function Camera(){
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
    this.points = [];

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

    }

    this.run = () => {
        if(this.errors.length > 0){
            this.subject.next(this.errors.shift());
        }
        this.interval = setInterval(()=>{
            let returnData;
            this.time.now = new Date().getTime();
            if(!this.stopCamera){
                returnData = {
                    stop: this.stopCamera,
                    fps: 0,
                    frame: null,
                    size: {
                        x: 640,
                        y: 480
                    },
                    points: []
                }
                let frame;
                if(this.vCap) frame = this.vCap.read();
                if(frame){
                    returnData.size = { x: frame.cols, y: frame.rows };
                    if(this.send_frame){
                        returnData.frame = FrametoImage(frame);
                    }
                    // pull points from frame


                }else if(this.simulatePoints){
                    // simulate points
                    if(!this.simPoints){
                        this.initSim();
                    }
                    for(let i = 0; i < this.simPoints.length; i++){
                        let point = this.simPoints[i];
                        point.update();
                        returnData.points.push(point.getPointObject());
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

    this.initSim = () => {
        this.simPoints = [];
        for(let i = 0; i < 3; i++){
            let point = new Point();
            point.init({
                size: {
                    x: 640,
                    y: 480,
                },
                vector: {
                    x: (Math.random() * 2 - 1) * .5,
                    y: (Math.random() * 2 - 1) * .5
                },
                pos: {
                    x: Math.random() * 640,
                    y: Math.random() * 480
                }
            })
            this.simPoints.push(point);
        }
    }

    this.stop = () => {
        this.stopCamera = true;
        delete this.simPoints;
        delete this.simulatePoints;
    }
}

function Point(){
    this.id;
    this.size = {
        x: 0,
        y: 0
    };
    this.pos = {
        x: 0,
        y: 0
    };
    this.init = (options) => {
        this.id = Math.random().toString(36).substr(2, 9);
        Object.keys(options).forEach((key)=>{this[key] = options[key];});
    }
    this.update = () => {
        if(this.pos.x + this.vector.x < 0 || this.pos.x + this.vector.x > this.size.x){
            this.vector.x = -this.vector.x;
        }
        if(this.pos.y + this.vector.y < 0 || this.pos.y + this.vector.y > this.size.y){
            this.vector.y = -this.vector.y;
        }
        this.pos = {
            x: this.pos.x + this.vector.x,
            y: this.pos.y + this.vector.y
        }
    }
    this.getPointObject = () => {
        let tmp = {
            id: this.id,
            pos: {
                x: this.pos.x * 100 / this.size.x,
                y: this.pos.y * 100 / this.size.y
            }
        }
        return tmp;
    }
}

module.exports.init = Init;
module.exports.startCapture = StartCapture;
module.exports.stopCapture = StopCapture;