import { Injectable } from '@angular/core';
declare var io;
declare var ss;

@Injectable()
export class SocketIO{
    public io;
    public ss;
    constructor(){
        this.io = io('http://localhost:3000');
        this.ss = ss;
    }
}