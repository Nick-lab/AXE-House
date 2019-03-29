const ss = require('socket.io-stream');
const cvModule = require('./opencv');

function Process(socket, io){
    console.log('user connected');
    socket.join('camera');

    socket.on('camera-init', ()=>{
        console.log('Camera Init');
        cvModule.init({send_frame: true}).subscribe((data)=>{
            io.to('camera').emit('frame-data', data);
        });
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