import { Injectable } from "@angular/core";
import { SocketIO } from "./socket.provider";
import { AlertController } from "ionic-angular";
import { ElectronProvider } from "./electron/electron";

@Injectable()
export class CameraController{
    private events = {};
    public recording = false;

    constructor(private socket: SocketIO, private alert: AlertController, private electron: ElectronProvider){
        this.electron.ipc.on('frame-data', (event, data)=>{
            if(data.noFrame){ this.recording = false; } else { this.recording = true; }
            if(this.events['frame']) this.events['frame'](data);
        });

        this.socket.io.on('camera-error', (data)=>{
            let alert = this.alert.create({
                title: 'Camera Error',
                message: data.message ? data.message : 'Non Descript Camera Error: ' + data.error,
                buttons: ['Ok']
            });
            alert.present();
        })
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