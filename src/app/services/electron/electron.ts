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
  public ipc: any = electron.ipcRenderer;
  public fullscreen: boolean = false;
  constructor() {
    window.addEventListener('resize', ()=>{
      this.fullscreen = this.isFullScreen();
    })
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
    this.ipc.send('app-quit');
  }

  isFullScreen() {
    if (BrowserWindow.getFocusedWindow().isMaximized() || (window.innerWidth == screen.width && window.innerHeight == screen.height)) {
      this.fullscreen = true;
      return true;
    } else {
      this.fullscreen = false;
      return false;
    }
  }

  localSave(file, data, json = true){
    return new Promise((res)=>{
      this.ipc.send('local-store', {file, data, json });
      this.ipc.once('local-store-reply', (e,reply)=>{
        res(reply);
      });
    })
  }
  
  localGet(file){
    return new Promise((res)=>{
      this.ipc.send('local-get', {file: file });
      this.ipc.once('local-get-reply', (e,data)=>{
        res(data);
      });
    })
  }

}
