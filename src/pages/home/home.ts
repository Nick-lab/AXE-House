import { Component, ViewChild } from '@angular/core';
import { NavController, Events } from 'ionic-angular';
import { CameraController } from '../../app/services/camera.provider';

import "pixi";
import "p2";
import * as Phaser from 'phaser-ce';
import { ElectronProvider } from '../../app/services/electron/electron';

import { Planks } from './scenes/planks';
import { Spots } from './scenes/spots';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  @ViewChild('container') container: any;
  config = {
    width: '100%',
    height: '100%',
    renderer: Phaser.CANVAS,
    antialias: true,
    parent: 'game-container'
  };
  game;
  resizeKeys = ['plankCount', 'boardSize', 'boardSizeAdjust'];
  constructor(
    public navCtrl: NavController,
     private camera: CameraController, 
     private events: Events, 
     private electron: ElectronProvider
     ) {

    this.events.subscribe('game:settings', (settings:any)=>{
      this.game.settingsResize = true;
      Object.keys(settings).forEach((key)=>{this.game[key] = settings[key]});
    });

  }

  ionViewWillEnter() {
    // this.config.width = this.container.nativeElement.scrollWidth;
    // this.config.height = this.container.nativeElement.scrollHeight;
    this.game = new Phaser.Game(this.config);
    this.electron.localGet('game-settings.json').then((data)=>{
      if(data !== null) Object.keys(data).forEach((key)=>{this.game[key] = data[key]});
      this.game.state.add('main', Planks, true);
    });
    console.log(this.game);
    this.camera.on('frame', (data)=>{
      this.game.frameData = data;
    });
    this.camera.Init();
    
  }
}