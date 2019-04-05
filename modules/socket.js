const ss = require('socket.io-stream');
const cvModule = require('./opencv');

function Process(socket, io){
    console.log('user connected');
    socket.join('camera');

    socket.on('camera-init', ()=>{
        console.log('Camera Init');
        let subject = cvModule.init({send_frame: true});
        subject.subscribe((data)=>{
            
            if(data.error){
                global.windows['main-window'].webContents.send('camera-error', data);
            }else{
                global.windows['main-window'].webContents.send('frame-data', data);
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