import { Component, ViewChild } from '@angular/core';
import { NavController } from 'ionic-angular';
import { CameraController } from '../../app/services/camera.provider';

import "pixi";
import "p2";
import * as Phaser from 'phaser-ce';


@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  @ViewChild('container') container: any;
  config = {
    width: 0,
    height: 0,
    renderer: Phaser.AUTO,
    antialias: true,
    parent: 'game-container'
  };
  game;
  constructor(public navCtrl: NavController, private camera: CameraController) {

  }

  ionViewWillEnter() {
    this.config.width = this.container.nativeElement.scrollWidth;
    this.config.height = this.container.nativeElement.scrollHeight;
    this.game = new Phaser.Game(this.config);
    this.game.state.add('main', Default, true);
    console.log(this.game);

    this.camera.on('frame', (data)=>{
      if(data.points){
        this.game.points = data.points;
      }
    });
    this.camera.Init();
  }

}


function Default() {
  var arrow;
  var target;
}

Default.prototype = {
  preload: function () {
    this.load.image('arrow', 'assets/game_assets/sprites/longarrow.png');
    this.load.image('ball', 'assets/game_assets/sprites/pangball.png');
  },
  create: function () {
    this.physics.startSystem(Phaser.Physics.ARCADE);

    this.stage.backgroundColor = '#0072bc';
    this.points = {};
  },
  update: function () {
    if(this.game.points && this.game.points.length > 0){
      this.game.points.forEach(point => {
        console.log(point);
        let pos = {
          x: point.pos.x * this.game.width / 100,
          y: point.pos.y * this.game.height / 100
        }
        if(this.points[point.id]){
          this.points[point.id].x = pos.x;
          this.points[point.id].y = pos.y;
        }else{
          let point = this.add.sprite(pos.x,pos.y, 'ball');
          point.anchor.setTo(0.5,0.5);
          point.inputEnabled = true;
          point.input.enableDrag(true);
          this.points[point.id] = point;
        }
      });
      console.log(this.points);
    }
  }
}