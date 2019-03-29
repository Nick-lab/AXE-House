import { Injectable } from "@angular/core";
import { SocketIO } from "./socket.provider";
import { Observable } from "rxjs";

@Injectable()
export class CameraController{
    private events = {};
    public recording = false;

    constructor(private socket: SocketIO){
        this.socket.io.on('frame-data', (data)=>{
            if(data.noFrame){ this.recording = false; } else { this.recording = true; }
            console.log('recording', this.recording);
            if(this.events['frame']) this.events['frame'](data);
        });
    }

    public Init(){
        console.log('Init Camera');
        this.socket.io.emit('camera-init');
    }

    public Stop(){
        console.log('Stop Camera');
        this.socket.io.emit('camera-stop');
    }

    public on(event:string, callback){
        this.events[event] = callback;
    }

}