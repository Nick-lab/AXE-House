function Process(socket){
    console.log('user connected');

    socket.on('test', ()=>{
        socket.emit('success');
    })

    socket.on('disconnect', ()=>{
        console.log('user disconnected');
    })
}

module.exports.process = Process;