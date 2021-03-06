import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';

import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';
import { ElectronProvider } from './services/electron/electron';
import { SocketIO } from './services/socket.provider';
import { CameraController } from './services/camera.provider';
import { Settings } from '../pages/settings/settings';

@NgModule({
  declarations: [
    MyApp,
    HomePage,
    Settings
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    IonicModule.forRoot(MyApp)
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    Settings
  ],
  providers: [
    StatusBar,
    SplashScreen,
    ElectronProvider,
    SocketIO,
    CameraController,
    {provide: ErrorHandler, useClass: IonicErrorHandler}
  ]
})
export class AppModule {}
