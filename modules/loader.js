const { BrowserWindow, ipcMain } = require('electron');
const files = require('./files');
var loader;
var interval;
var quotes;

var total = 1000;
var intTime = 500;
var quoteUp = 3000;
var at = 0;


function Init(){
    files.localGet({file: 'quotes.json'}).then((data)=>{
        quotes = data;
        console.log('Data Type Quotes', data.length);
        loader = new BrowserWindow({
            title: 'Axe House',
            show: false,
            width: 270,
            height: 450,
            minWidth: 270,
            minHeight: 450,
            maxWidth: 270,
            maxHeight: 450,
            resizable: false,
            fullscreen: false,
            transparent: true,
            frame: false,
            icon: './www/assets/icon/favicon.png'
        })
        loader.loadURL(global.paths.remote + '/loader/loader.html');
        //loader.webContents.openDevTools();
        loader.webContents.on('did-finish-load', function() {
            loader.show();
            loader.focus();
        });
    });
}

ipcMain.on('loader', (e, data)=>{
    console.log('loader', data);
    if(data.action == 'init'){
        at = 0;
        clearInterval(interval);
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
        at += intTime;
        let tmp = {};
        if(at % quoteUp == 0) tmp.quote = quotes[Math.floor(Math.random() * (quotes.length - 1))];
        tmp.progress = at * 100 / total;
        loader.webContents.send('loader', tmp);
        if(at >= total){
            setTimeout(()=>{
                loader.close();
                global.windows['main-window'].show();
                global.windows['main-window'].focus();
                clearInterval(interval);
            }, 500);
        }
    }, intTime);
}

module.exports.init = Init;