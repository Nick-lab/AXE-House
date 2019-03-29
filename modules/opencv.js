const { Observable } = require('rxjs');
const cv = require('opencv4nodejs');

var vCap = false;
var stopCamera = false;
var interval = null;
var time = {
    now: 0,
    last: 0,
    deltaTime: 0
}

function Init(options){
    args = {
        send_frame: false
    }
    Object.keys(options).forEach((key)=>{args[key] = options[key]});
    stop = false;
    vCap = new cv.VideoCapture(0);
    if(vCap){
        return new Observable((observer)=>{
            interval = setInterval(()=>{
                
                if(!stopCamera){
                    time = new Date().getTime();
                    vCap.readAsync((err, frame)=>{
                        if(!err){
                            returnData = {
                                stop: stopCamera,
                                fps: 0,
                                frame: null,
                                size: {
                                    x: frame.cols,
                                    y: frame.rows
                                },
                                points: []
                            }
                            returnData.frame = FrametoImage(frame);
                            // pull points from frame

                            // finish time calc
                            time.deltaTime = time.now - time.last;
                            time.last = time.now;
                            returnData.fps = 1000 / time.deltaTime;
                            observer.next(returnData);
                        }else{
                            throw err;
                        }
                    });
                }else{
                    returnData = {
                        noFrame: true
                    }
                    observer.next(returnData);
                    clearInterval(interval);
                }
            }, 0);
        });
    }
}

function Run(){

}

function FrametoImage(img){
    buffer = cv.imencode('.jpg', img);
    return buffer.toString('base64');
}

function StopCapture(){
    stopCamera = true;
}

module.exports.init = Init;
module.exports.stopCapture = StopCapture;