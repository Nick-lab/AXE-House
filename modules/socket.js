const { app, ipcMain } = require('electron');
const ss = require('socket.io-stream');
const cvModule = require('./opencv');

app.on('before-quit', (e)=>{
    cvModule.stopCapture();
    //subject.unsubscribe();
})

function Process(socket, io){
    console.log('user connected');
    socket.join('camera');

    socket.on('camera-get-settings', ()=>{
        socket.emit('settings', cvModule.getSettings());
    });

    socket.on('camera-settings', (options)=>{
        cvModule.updateCamera(options);
    });

    socket.on('camera-init', ()=>{
        console.log('Camera Init');
        cvModule.init();
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