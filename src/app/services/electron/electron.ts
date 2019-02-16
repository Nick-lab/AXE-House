import { Injectable } from '@angular/core';
declare var electron: any;
const { BrowserWindow } = electron.remote;
/*
  Generated class for the ElectronProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class ElectronProvider {
  ipc: any = electron.ipcRenderer;
  constructor() {
    
  }

  openNewWindow(page = false) {
    if (page) {

    } else {
      this.ipc.send('open-window', { id: 'something' });
    }
  }

  minimizeWindow() {
    let window = BrowserWindow.getFocusedWindow();
    window.minimize();
  }

  maximizeWindow() {
    let window = BrowserWindow.getFocusedWindow();
    if (window.isMaximized()) {
      window.unmaximize();
      return false;
    } else {
      window.maximize();
      return true;
    }
  }
  closeWindow() {
    let window = BrowserWindow.getFocusedWindow();
    window.close();
  }

  isFullScreen() {
    let window = BrowserWindow.getFocusedWindow();
    if (window.isMaximized()) {
      return true;
    } else {
      return false;
    }
  }

  localSave(file, data){
    this.ipc.send('local-store', {file, data });
    this.ipc.once('local-store-reply', (e,reply)=>{
      console.log('store response',reply);
    });
  }
  
  localGet(file){
    this.ipc.send('local-get', {file: file });
    this.ipc.once('local-get-reply', (e,data)=>{
      console.log('get response',data);
    });
  }

}
