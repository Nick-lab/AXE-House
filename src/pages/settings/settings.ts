import { Component } from "@angular/core";
import { SocketIO } from "../../app/services/socket.provider";
import { NavController } from "ionic-angular";

@Component({
    selector: 'settings',
    templateUrl: 'settings.html'
})
export class Settings{
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
        }
    }

    onSend(){
        this.socket.io.emit('camera-settings', this.settings);
    }

    onClose(){
        this.navCtrl.pop();
    }

    constructor(private socket: SocketIO, private navCtrl: NavController){
        this.socket.io.on('settings', (settings)=>{
            console.log(settings);
            this.settings = settings;
        });
        this.socket.io.emit('camera-get-settings');
    }
}