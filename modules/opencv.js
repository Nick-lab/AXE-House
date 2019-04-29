
const {BrowserWindow, ipcMain, app } = require('electron');
const files = require('./files');
var CVWindow;
var config;

// setup IPC listeners from process window
ipcMain.on('frame-data', (e, data)=>{
    global.windows['main-window'].webContents.send('frame-data', data);
});


function createWindow() {
    return new Promise((res)=>{
        global.windows['CVWindow'] = CVWindow = new BrowserWindow({
            show: false
        })
        CVWindow.loadURL(global.paths.remote + '/camera/camera.html');
        CVWindow.webContents.openDevTools();
        CVWindow.webContents.on('did-finish-load', function() {
            res();
        });
    });
}

function Init(){
    files.localGet({file: 'config.json'}).then((data)=>{
        if (data == null) {
            config = {
                calibrated: false,
                calibration_points: [],
                settings: {}
            }
            files.localStore({file: 'config.json', data: config, json: true});
        } else {
            config = data;
        }
        createWindow().then(()=>{
            console.log(config);
            CVWindow.webContents.send('init', config);
        })
    })
}

function Calibrate(){

}

function UpdateCamera(options) {
    config.settings = options;
    CVWindow.webContents.send('update-settings', options);
    files.localStore({file: 'config.json', data: config, json: true});
}

function GetSettings() {
    return config.settings;
}

function StopCapture() {
    CVWindow.webContents.send('stop');
}

module.exports.init = Init;
module.exports.calibrate = Calibrate;
module.exports.stopCapture = StopCapture;
module.exports.updateCamera = UpdateCamera;
module.exports.getSettings = GetSettings;