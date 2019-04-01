const ss = require('socket.io-stream');
const cvModule = require('./opencv');

function Process(socket, io){
    console.log('user connected');
    socket.join('camera');

    socket.on('camera-init', ()=>{
        console.log('Camera Init');
        let subject = cvModule.init({send_frame: false, simulatePoints: true});
        subject.subscribe((data)=>{
            if(data.error){
                io.to('camera').emit('camera-error', data);
            }else{
                io.to('camera').emit('frame-data', data);
            }
        });
        cvModule.startCapture();
    });

    socket.on('camera-stop', ()=>{ 
        console.log('Camera Stop');
        cvModule.stopCapture(); 
    });

    socket.on('disconnect', ()=>{
        console.log('user disconnected');
    })
}

module.exports.process = Process;