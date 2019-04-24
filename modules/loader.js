const { BrowserWindow, ipcMain } = require('electron');
const files = require('./files');
var loader;
var interval;
var quotes;

function Init(){
    files.localGet({file: 'quotes.json'}).then((data)=>{
        quotes = data;
        console.log('Data Type Quotes', data.length);
        loader = new BrowserWindow({
            title: 'Axe House',
            show: false,
            width: 300,
            height: 450,
            minWidth: 300,
            minHeight: 450,
            maxWidth: 300,
            maxHeight: 450,
            //backgroundColor: '#ffffff',
            transparent: true,
            frame: false,
            icon: './www/assets/icon/favicon.png'
        })
        loader.loadURL(global.paths.remote + '/loader/loader.html');
        loader.webContents.openDevTools();
        loader.webContents.on('did-finish-load', function() {
            loader.show();
            loader.focus();
        });
    });
}

ipcMain.on('loader', (e, data)=>{
    console.log('loader', data);
    if(data.action == 'init'){
        Load();
    }
})

function Load() {
    console.log('load');
    let quote = quotes[Math.floor(Math.random() * (quotes.length - 1))];
    loader.webContents.send('loader', {
        quote
    });
    //make call to server

    //pull down game scripts

    //pull down game assets

    //check move assets and scripts to needed folders
    interval = setInterval(()=>{
        let quote = quotes[Math.floor(Math.random() * (quotes.length - 1))];
        loader.webContents.send('loader', {
            quote
        });
    }, 5000);
    setTimeout(()=>{
        loader.close();
        global.windows['main-window'].show();
        global.windows['main-window'].focus();
        clearInterval(interval);
    }, 10000)
    
}

module.exports.init = Init;