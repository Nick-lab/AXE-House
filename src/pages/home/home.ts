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
    width: '100%',
    height: '100%',
    renderer: Phaser.CANVAS,
    antialias: true,
    parent: 'game-container'
  };
  game;
  constructor(public navCtrl: NavController, private camera: CameraController) {

  }

  ionViewWillEnter() {
    // this.config.width = this.container.nativeElement.scrollWidth;
    // this.config.height = this.container.nativeElement.scrollHeight;
    this.game = new Phaser.Game(this.config);
    this.game.state.add('main', Default, true);
    console.log(this.game);
    this.camera.on('frame', (data)=>{
      this.game.frameData = data;
    });
    this.camera.Init();
  }

  
}


function Default() {
}

Default.prototype = {
  preload: function () {
    this.load.image('ball', 'assets/game_assets/sprites/pangball.png');
    this.game.load.spritesheet('pig', 'assets/game_assets/sprites/Piggy_sheet.png', 150,150, 8);
  },
  create: function () {
    this.physics.startSystem(Phaser.Physics.ARCADE);
    this.game.scale.scaleMode = Phaser.ScaleManager.RESIZE;
    this.stage.backgroundColor = '#0072bc';
    this.fps = this.game.add.text(30,30, "FPS: ", { font: 'bold 10pt Arial', fill: 'white', align: 'left' });
    this.pigs = [];
    this.points = {};
    this.graphics = this.game.add.graphics(0,0);
    this.once = true;
  },
  update: function () {
    this.graphics.clear();
    if(this.game.frameData){
      this.pointsProcess();
      this.fps.text = "FPS: " + Math.round(this.game.frameData.fps);
    }
  },
  createPig: function(){
    let pig = {
      pos: {
        x: 0,
        y: 0
      },
      sprite: this.game.add.sprite(this.game.width / 2, this.game.height / 2, 'pig')
    }
    pig.sprite.animations.add('run');
    pig.sprite.animations.play('run', 16, true);
  },



  pointsProcess: function () {
    let pointKeys = this.points ? Object.keys(this.points) : [];

    if(this.game.frameData && Object.keys(this.game.frameData.points).length > 0){
      let newPoints = this.game.frameData.points;
      let newKeys = Object.keys(this.game.frameData.points);
      newKeys.forEach((k)=>{
        if(pointKeys.indexOf(k) > -1){
          this.updatePoint(k, this.toScreenPos(newPoints[k].center));
        }else{
          this.createPoint(k, this.toScreenPos(newPoints[k].center));
        }
      });
      pointKeys.forEach((k)=>{
        if(!this.points[k].updated){
          this.deletePoint(k);
        }else{
          this.points[k].updated = false;
        }
      })
    }else if(pointKeys.length > 0){
      pointKeys.forEach((k)=>{this.deletePoint(k);});
    }
    if(pointKeys.length > 0){
      pointKeys.forEach((k)=>{this.renderPoint(k);});
    }
  },
  toScreenPos: function (pos) {
    let width = this.game.width > this.game.height;
    let c = this.game.frameData.size;
    let s = { x: this.game.width, y: this.game.height };
    let newPos = {
      x: !width ? (pos.x * (s.y * c.x / c.y) / c.x) - (((s.y * c.x / c.y) - s.x) / 2) : pos.x * s.x / c.x,
      y: width ? (pos.y * (s.x * c.y / c.x) / c.y) - (((s.x * c.y / c.x) - s.y) / 2) : pos.y * s.y / c.y
    };
    // let r;
    // let offset;
    // if(width){
    //   r = {
    //     x: s.x,
    //     y: s.x * c.y / c.x
    //   }
    //   offset = (r.y - s.y) / 2;
    // }else{
    //   r = {
    //     x: s.y * c.x / c.y,
    //     y: s.y
    //   }
    //   offset = (r.x - s.x) / 2;
    // }
    // let newPos = {
    //   x: !width ? (pos.x * r.x / c.x) - offset : pos.x * r.x / c.x,
    //   y: width ? (pos.y * r.y / c.y) - offset : pos.y * r.y / c.y
    // };
    return newPos;
  },
  createPoint: function (key, pos) {
    let name = this.game.add.text(pos.x, pos.y - 10, key, { font: 'bold 10pt Arial', fill: 'white', align: 'left' });
    name.anchor.setTo(0.5, 1);
    this.points[key] = { pos, name, counto: 1000, countat: 0, lerped: 0, tracking: true };
  },
  deletePoint: function (key) {
    this.points[key].name.destroy();
    delete this.points[key];
  },

  updatePoint: function (key, pos) {
    let point = this.points[key];
    point.lastPos = point.pos;
    point.pos = {
      x: this.lerp(point.lastPos.x, pos.x, .5),
      y: this.lerp(point.lastPos.y, pos.y, .5)
    };
    point.updated = true;
  },
  renderPoint: function(key) {
    if(this.points[key]){
      let point = this.points[key];
    
      let pos = point.pos;
      let r = 10;
      let dist = 10;
      this.graphics.lineStyle(0);
      this.graphics.beginFill(0xFFFF0B, .5);
      this.graphics.drawCircle(pos.x,pos.y,r);
      this.graphics.endFill();
      let xs = point.lastPos.x - pos.x;
      let ys = point.lastPos.y - pos.y;
      if(Math.hypot(xs,ys) < dist ){
        if(point.tracking){
          if(point.countat <= point.counto){
            point.countat += this.game.time.elapsed;
          }
          point.lerped = this.lerp(point.lerped, point.countat, 0.5);
          this.graphics.lineStyle(5, 0x000000, 1);
          this.graphics.arc(pos.x, pos.y, 10, 0, point.lerped * (Math.PI * 2) / point.counto, false);
        }else{
          point.tracking = true;
          point.countat = 0;
          point.lerped = 0;
        }
      }else{
        point.tracking = false;
        point.countat = 0;
        point.lerped = 0;
      }

      point.name.x = pos.x;
      point.name.y = pos.y - r / 2;
    }
  },
  lerp: function(start,end,amt){
    return (1-amt)*start+amt*end;
  }
}