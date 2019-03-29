import { Component, OnInit } from '@angular/core';
import { SocketIO } from '../services/socket.provider';
import { CameraController } from '../services/camera.provider';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
  success:boolean = false;
  videoElement:HTMLVideoElement;
  canvasElement:HTMLCanvasElement;
  ctx:CanvasRenderingContext2D;
  cSize = { x:0, y:0 };
  iSize = { x:0, y:0 };
  rSize = { x:0, y:0 };
  fps;


  constructor(private socket: SocketIO, private camera: CameraController){
  }

  ngOnInit(){
    this.videoElement = <HTMLVideoElement>document.getElementById("Camera");
    this.canvasElement = <HTMLCanvasElement>document.getElementById("Canvas");
    this.camera.on('frame', (data)=>{
      console.log(data);
    });
    this.camera.Init();
  }

  onToggleRecord(){
    if(this.camera.recording){
      this.camera.Stop();
    }else{
      this.camera.Init();
    }
  }

}
