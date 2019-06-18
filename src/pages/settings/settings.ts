import { Component } from "@angular/core";
import { SocketIO } from "../../app/services/socket.provider";
import { NavController, Events } from "ionic-angular";
import { ElectronProvider } from "../../app/services/electron/electron";

@Component({
    selector: 'settings',
    templateUrl: 'settings.html'
})
export class Settings{
    tab:string = 'camera';

    settings:any = {
        rangeLower: {
            h: 0,
            s: 0,
            l: 0
        },
        rangeUpper: {
            h: 0,
            s: 0,
            l: 0
        },
        preview: 'none',
        camera: true
    }

    gameSettings: any = {
        pointToHit: 200,
        pointSensitivity: 5,
        pointHitRadius: 50,
        boardSize: 75,
        plankCount: 4,
        boardSizeAdjust: {
            x: 0,
            y: 0
        },
        boardPositionAdjust: {
            x: 0,
            y: 0
        },
        pointtoClick: 1000
    }

    onSettings(){
        this.events.publish('game:settings', this.gameSettings);
        this.electron.localSave('game-settings.json', this.gameSettings);
    }

    onSend(){
        this.socket.io.emit('camera-settings', this.settings);
    }

    onClose(){
        this.navCtrl.pop();
    }

    constructor(private socket: SocketIO, private navCtrl: NavController, private events: Events, private electron: ElectronProvider){
        this.socket.io.on('settings', (settings)=>{
            console.log(settings);
            this.settings = settings;
        });
        this.socket.io.emit('camera-get-settings');

        this.electron.localGet('game-settings.json').then((data)=>{
            if(data == null){
                this.electron.localSave('game-settings.json', this.gameSettings);
            }else{
                this.gameSettings = data;
            }
        });
    }
}