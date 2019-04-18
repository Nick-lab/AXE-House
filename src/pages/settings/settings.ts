import { Component } from "@angular/core";
import { SocketIO } from "../../app/services/socket.provider";
import { NavController } from "ionic-angular";

@Component({
    selector: 'settings',
    templateUrl: 'settings.html'
})
export class Settings{
    settings = {

    }

    onSend(){
        console.log(this.settings);
        this.socket.io.emit('camera-settings', this.settings);
    }

    onClose(){
        this.navCtrl.pop();
    }

    constructor(private socket: SocketIO, private navCtrl: NavController){
        this.socket.io.on('settings', (settings)=>{
            this.settings = settings;
        });
        this.socket.io.emit('camera-get-settings');
    }
}