var electron = require('electron');
var { ipcRenderer } = electron;
var quote = document.getElementsByClassName('quote');
var prog = document.getElementsByClassName('progress');
(function(){
    console.log('Call Init');
    ipcRenderer.send('loader', { action: 'init' });
})();

ipcRenderer.on('loader', (e, data)=>{
    if(data.quote){
        console.log
        quote[0].innerText = data.quote;
    }
    if(data.progress){
        prog[0].style.width = data.progress + '%';
    }
})



