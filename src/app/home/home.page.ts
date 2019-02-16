import { Component } from '@angular/core';
import { SocketIO } from '../services/socket.provider';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  success:boolean = false;

  constructor(private socket: SocketIO){
    socket.io.on('success', ()=>{
      this.success = true;
    })
  }

  onEmitTest(){
    this.socket.io.emit('test');
  }
}
