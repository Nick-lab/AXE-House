import {pointsProcess, lerp, createPoint, updatePoint, deletePoint, toScreenPos, renderPoint} from './points-track';

export function Planks() {
}
Planks.prototype = {
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
    this.boardColors = ["E6FB04", "FF3300", "33FF00", "00FFFF"];
    this.boards = [];

    // game vars

    this.pointToHit = 200;
    this.pointSensitivity = 5;
    this.pointHitRadius = 50;

    this.plankCount = 4;
    this.boardSize = 75;
    this.boardSizeAdjust = {
      x: 0,
      y: 0
    }
    this.boardPositionAdjust = {
      x: 0,
      y: 0
    }

    this.playArea = {
      pos: {
        x: 0,
        y: 0
      },
      size: {
        x: 0,
        y: 0
      }
    }
    this.pointtoClick = 1000;

    // end game vars
    this.BoardResize();

  },
  update: function () {
    // clear screen of raw visuals
    if(this.game.settingsResize) {
      this.BoardResize();
      this.game.settingsResize = false;
    } 
    this.graphics.clear();

    this.boards.forEach((board, i)=>{
      this.graphics.beginFill('0x' + this.boardColors[i % this.plankCount]);
      this.graphics.drawPolygon(board.poly.points);
      this.graphics.endFill();
    });

    if (this.game.input.activePointer.leftButton.isDown) {
      let mousePos = {x: this.game.input._x, y: this.game.input._y};
      if(!this.points['cursor']) this.createPoint('cursor', mousePos);
      else this.updatePoint('cursor', mousePos); 
    }else if(this.points['cursor']){
      this.deletePoint('cursor');
    }

    // if frame data from backend Computer Vision process points
    if(this.game.frameData){
      this.pointsProcess();
      this.fps.text = "FPS: " + Math.round(this.game.frameData.fps);
    }
  },
  resize: function(){
    this.BoardResize();
  },
  BoardResize: function (){
    this.boards = [];
    let width = this.game.width > this.game.height;
    this.playArea.size = {
      x: (width ? this.game.height * (this.game.boardSize / 100) : this.game.width * (this.game.boardSize / 100)) + this.game.boardSizeAdjust.x ,
      y: (width ? this.game.height * (this.game.boardSize / 100) : this.game.width * (this.game.boardSize / 100)) + this.game.boardSizeAdjust.y 
    }
    this.playArea.pos = {
      x: (this.game.width / 2 - this.playArea.size.x / 2) + this.game.boardPositionAdjust.x,
      y: (this.game.height / 2 - this.playArea.size.y / 2) + this.game.boardPositionAdjust.y
    }
    for(let i = 0; i < this.game.plankCount; i++){
      let box = new this.Box();
      box.init({
        points: [
          {
            x: (this.playArea.size.x/this.game.plankCount * i) + this.playArea.pos.x,
            y: this.playArea.pos.y
          },{
            x: (this.playArea.size.x/this.game.plankCount * (i + 1)) + this.playArea.pos.x,
            y: this.playArea.pos.y
          },{
            x: (this.playArea.size.x/this.game.plankCount * (i + 1)) + this.playArea.pos.x,
            y: this.playArea.pos.y + this.playArea.size.y
          },{
            x: (this.playArea.size.x/this.game.plankCount * i) + this.playArea.pos.x,
            y: this.playArea.pos.y + this.playArea.size.y
          } 
        ]
      });
      this.boards.push(box);
    }
  },
  Box: function(){
    this.poly = null;

    this.init = (options)=>{
      if(options.points){
        let pointArr = [];
        options.points.forEach((point)=>{
          pointArr.push(new Phaser.Point(point.x,point.y));
        });
        this.poly = new Phaser.Polygon(pointArr);
      }
    };
  },
  pointsProcess, lerp, createPoint, updatePoint, deletePoint, toScreenPos, renderPoint
}