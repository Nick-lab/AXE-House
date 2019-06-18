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
    this.Objects = [];

    this.cpText = this.game.add.text(10, 100, "Player 1" , { font: "bold 12px Arial", fill: "#fff", align: "left" });
    this.cpText.setShadow(3, 3, 'rgba(0,0,0,0.5)', 2);

    this.currentPlayer = 0;
    this.players = [];
    this.gameWon = false;

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

    if(this.gameWon && !this.gameOnce){
      this.gameOnce = true;
      this.wonText = this.game.add.text(this.game.width / 2, this.game.height / 2, "Player "+ (this.currentPlayer + 1) + " Won" , { font: "bold 32px Arial", fill: "#fff", align: "left" });
      this.wonText.setShadow(3, 3, 'rgba(0,0,0,0.5)', 2);
      this.wonText.anchor.setTo(0.5, 1);
    }
    this.Objects.forEach((object, i)=>{
      if(object.poly){
        if(object.plank){
          this.graphics.beginFill('0x' + (this.players[this.currentPlayer].plank == object.index ? this.boardColors[2] : this.boardColors[1]));
          this.graphics.drawPolygon(object.poly.points);
          this.graphics.endFill();
        }
      }else{
        object.render();
      }
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
  hitPlank: function(index) {
    if(!this.gameWon){
      if(index == this.players[this.currentPlayer].plank){
        if(this.players[this.currentPlayer].checkWin()){
          this.gameWon = true;
        }
      }else{
        this.currentPlayer = this.currentPlayer + 1 <= this.players.length -1 ? this.currentPlayer + 1 : 0;
        this.cpText.setText("Player "+ (this.currentPlayer + 1));
      }
    }
  },
  resetGame: function(){
    this.gameOnce = false;
    this.gameWon = false;
    this.currentPlayer = 0;
    if(this.wonText) this.wonText.destroy();
    this.cpText.setText("Player "+ (this.currentPlayer + 1));
    this.players = [];
    this.BoardResize();
  },
  resize: function(){
    if(this.wonText){
      this.wonText.x = this.game.width / 2;
      this.wonText.y = this.game.height / 2;
    }
    this.BoardResize();
  },
  BoardResize: function (){
    this.Objects = [];
    if(this.game.playerCount != this.players.length){this.players = [];}
    if(this.players.length < this.game.playerCount){
      for(let i = 0; i < this.game.playerCount; i++){
        let player = new this.Player();
        player.init({
          plank: this.game.plankCount - 1,
          totalPlanks: this.game.plankCount - 1
        });
        this.players.push(player);
      }
    }
    let width = this.game.width > this.game.height;
    this.playArea.size = {
      x: (width ? this.game.height * (this.game.boardSize / 100) : this.game.width * (this.game.boardSize / 100)) + this.game.boardSizeAdjust.x ,
      y: (width ? this.game.height * (this.game.boardSize / 100) : this.game.width * (this.game.boardSize / 100)) + this.game.boardSizeAdjust.y 
    }
    this.playArea.pos = {
      x: (this.game.width / 2 - this.playArea.size.x / 2) + this.game.boardPositionAdjust.x,
      y: (this.game.height / 2 - this.playArea.size.y / 2) + this.game.boardPositionAdjust.y
    }
    
    let reset = new this.Reset();
    reset.init({scene: this});
    this.Objects.push(reset);
    for(let i = 0; i < this.game.plankCount; i++){
      let box = new this.Box();
      box.init({
        index: i,
        scene: this,
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
      this.Objects.push(box);
    }
  },
  Reset: function () {
    this.r = 100
    this.pos = {
      x: 0,
      y: 0
    }
    this.init = (options) => {
      this.scene = options.scene;
      this.graphics = options.scene.graphics;
      this.pos = {
        x: this.scene.game.width - (this.r + 20),
        y: this.r + 20
      }
    }
    this.render = () => {
      this.graphics.lineStyle(1, 0x00ff00, 1);
      this.graphics.drawCircle(this.pos.x, this.pos.y, this.r);
    }
    this.checkHit = (pos) => {
      let xs = this.pos.x - pos.x;
      let ys = this.pos.y - pos.y;
      if(Math.hypot(xs,ys) < this.r ){
        this.scene.resetGame();
      }
    }
  },
  Player: function (){
    this.plank = 0;
    this.direction = -1;
    this.totalPlanks = 3;
    this.init = (options) => {
      Object.keys(options).forEach((key)=>{ this[key] = options[key]; });
    }
    this.checkWin = () => {
      if(this.plank == 0 && this.direction == -1) this.direction = 1;
      this.plank += this.direction;
      if(this.direction == 1 && this.plank == this.totalPlanks){
        return true;
      }else{
        return false;
      }
    }
  },
  Box: function(){
    this.plank = true;
    this.poly = null;
    this.checkHit = (pos)=>{
      if(this.poly.contains(pos.x, pos.y)){
        this.scene.hitPlank(this.index);
      }
    }
    this.init = (options)=>{
      this.index = options.index;
      this.scene = options.scene;
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