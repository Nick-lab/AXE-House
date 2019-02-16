import { Injectable } from '@angular/core';
declare var io;
@Injectable()
export class SocketIO{
    public io;
    constructor(){
        this.io = io('http://localhost:3000');
    }
}