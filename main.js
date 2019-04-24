const { app, BrowserWindow, ipcMain } = require('electron');
const http = require('http');
const server = http.createServer(app);
const io = require('socket.io').listen(server);
const fs = require('fs');
const path = require('path');
const files = require('./modules/files');
const loader = require('./modules/loader');
const socketHandler = require('./modules/socket');
const port = 3000;

global.paths = {
  root: __dirname,
  storage: path.join(__dirname, 'storage'),
  remote: path.join(__dirname, 'remote')
};
global.windows = {};

function createWindow() {
  // Create the browser window.
  let win = new BrowserWindow({
    title: 'Axe House',
    show: false,
    width: 1080,
    height: 600,
    minWidth: 800,
    minHeight: 500,
    //backgroundColor: '#ffffff',
    //transparent: true,
    frame: false,
    icon: './www/assets/icon/favicon.png'
  })
  win.loadURL(`file://${__dirname}/www/index.html`);

  //// uncomment below to open the DevTools.

  win.webContents.openDevTools();

  // Event when the window is closed.
  win.on('closed', function () {
    win = null
  });

  global.windows['main-window'] = win;
}

ipcMain.on('local-store', (e, obj) => {
  files.localStore().then((result)=>{
    e.sender.send('local-store-reply', result);
  });
});

ipcMain.on('local-get', (e, obj) => {
  files.localGet().then((result)=>{
    e.sender.send('local-get-reply', result);
  });
});

ipcMain.on('app-quit', () => {
  console.log('App Quit')
  if (process.platform !== 'darwin') {
    app.quit();
  }
})

io.on('connection', (socket)=>{
  socketHandler.process(socket, io);
});

// Create window on electron intialization
app.on('ready', () => {
  loader.init();
  createWindow();
  files.initializeDirectory(global.paths.storage);
})

app.on('activate', function () {
  // macOS specific close process
  if (global.windows['main-window'] === null) {
    createWindow()
  }
});

server.listen(port, ()=>{
  console.log('Listening on port: '+ port);
})
