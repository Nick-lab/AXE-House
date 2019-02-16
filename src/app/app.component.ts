import { Component } from '@angular/core';

import { Platform, Events } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { trigger, state, style, animate, transition } from '@angular/animations';

import { ElectronProvider } from './services/electron/electron';
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.scss'],
  animations: [
    trigger('back-button', [
      state('true', style({
        left: '0px'
      })),
      state('false', style({
        left: '-50px'
      })),
      transition('true => false', animate('100ms ease-in')),
      transition('false => true', animate('100ms ease-out'))
    ]),
    trigger('title', [
      state('true', style({
        left: '0px'
      })),
      state('false', style({
        left: '-50px'
      })),
      transition('true => false', animate('100ms ease-in')),
      transition('false => true', animate('100ms ease-out'))
    ])
  ]
})
export class AppComponent {
  fullscreen = this.electron.isFullScreen();
  title = "Pheonix";
  titleHold = false;
  hasControls = {
    full: true,
    back: false
  };
  modals = [];
  constructor(
    platform: Platform,
    splashScreen: SplashScreen,
    statusBar: StatusBar,
    public electron: ElectronProvider,
    public events: Events
  ) {
    platform.ready().then(() => {
      statusBar.styleDefault();
      splashScreen.hide();
    });

    events.subscribe('window:title', (data) => {
      console.log('set title', this.titleHold);
      if (this.titleHold) {
        this.titleHold = false;
      } else {
        this.setTitle(data.title);
      }
    });

    document.title = this.title;
  }

  setTitle(title) {
    this.title = document.title = title;
  }

  onMin() {
    this.electron.minimizeWindow();
  }
  onMax() {
    this.fullscreen = this.electron.maximizeWindow();
  }
  onClose() {
    this.electron.closeWindow();
  }
  
  


  // constructor(
  //   private platform: Platform,
  //   private splashScreen: SplashScreen,
  //   private statusBar: StatusBar
  // ) {
  //   this.initializeApp();
  // }

  // initializeApp() {
  //   this.platform.ready().then(() => {
  //     this.statusBar.styleDefault();
  //     this.splashScreen.hide();
  //   });
  // }
}
