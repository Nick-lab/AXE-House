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