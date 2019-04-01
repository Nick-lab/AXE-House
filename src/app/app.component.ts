import { Component, ViewChild } from '@angular/core';
import { Platform, Events, Nav, App } from 'ionic-angular';
import { ElectronProvider } from './services/electron/electron';
import { trigger, state, style, animate, transition } from '@angular/animations';

import { HomePage } from '../pages/home/home';
@Component({
  templateUrl: 'app.html',
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
export class MyApp {
  fullscreen = this.electron.isFullScreen();
  title = "AXE House";
  titleHold = false;
  hasControls = {
    full: true,
    back: false
  };
  modals = [];
  @ViewChild('Nav') nav: Nav;

  rootPage: any = HomePage;

  constructor(
    platform: Platform,
    public electron: ElectronProvider,
    public events: Events,
    public app: App
  ) {
    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.

      this.nav.viewDidEnter.subscribe(() => {
        let activeNav = app.getActiveNav();
        if (activeNav.canGoBack()) {
          this.hasControls.back = true;
        } else {
          this.hasControls.back = false;
        }
      });

    });

    events.subscribe('window:title', (data) => {
      console.log('set title', this.titleHold);
      if (this.titleHold) {
        this.titleHold = false;
      } else {
        this.setTitle(data.title);
      }
    });

    events.subscribe('modal', (modal) => {
      this.modals.push(modal);
      this.hasControls.back = true;
    });
    events.subscribe('close-modal', (id = false) => {
      if (id) {
        for (let index = 0; index < this.modals.length; index++) {
          if (this.modals[index].id == id) {
            if (this.modals.length - 2 >= 0) {
              if (typeof this.modals[this.modals.length - 1].title != undefined) {
                console.log(this.modals[this.modals.length - 1].title);
                this.title = this.modals[this.modals.length - 1].title;
                this.titleHold = true;
              }
            }
            this.modals.splice(index, 1);
          }
        }
      } else {
        let ind = this.modals.length - 1;
        if (this.modals.length - 2 >= 0) {
          if (typeof this.modals[this.modals.length - 1].title != undefined) {
            console.log(this.modals[this.modals.length - 1].title);
            this.title = this.modals[this.modals.length - 1].title;
            this.titleHold = true;
          }
        }
        this.modals.splice(ind, 1);
      }
    });

    document.title = this.title;
  }

  setTitle(title) {
    this.title = document.title = title;
  }

  onBack() {
    if (this.modals.length >= 1) {
      let ind = this.modals.length - 1;
      this.modals[ind].modal.dismiss();
      if (this.modals.length - 2 >= 0) {
        if (typeof this.modals[this.modals.length - 1].title != undefined) {
          console.log(this.modals[this.modals.length - 1].title);
          this.title = this.modals[this.modals.length - 1].title;
          this.titleHold = true;
        }
      }
      this.modals.splice(ind, 1);
    } else {
      this.nav.pop().then(() => {
        this.checkBack();
      });
    }
  }

  checkBack() {
    let activeNav = this.app.getActiveNav();
    if (activeNav.canGoBack()) {
      this.hasControls.back = true;
    } else {
      this.hasControls.back = false;
    }
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

}

