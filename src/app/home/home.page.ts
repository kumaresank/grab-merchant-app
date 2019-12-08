import { Component, AfterViewInit } from '@angular/core';
import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';
import { QRScanner, QRScannerStatus } from '@ionic-native/qr-scanner/ngx';
import QRCode from 'qrcode';
import { LoadingController } from '@ionic/angular';
import { PaymentService } from '../services/payment.service';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements AfterViewInit {
  name: string = 'amit';
  generated: string = '';
  recievedToken: string;
  constructor(private androidPermissions: AndroidPermissions, public alertController: AlertController, private qrScanner: QRScanner, public loadingController: LoadingController, private payment: PaymentService) {
    this.loadQR();
  }

  ngAfterViewInit() {
    this.androidPermissions.requestPermissions([this.androidPermissions.PERMISSION.READ_PHONE_STATE, this.androidPermissions.PERMISSION.CAMERA]);
  }

  async presentAlert(msg) {
    const alert = await this.alertController.create({
      header: 'Alert',
      message: msg,
      buttons: ['OK']
    });

    await alert.present();
  }

  loadQR() {
    const qrcode = QRCode;
    if (this.name) {
      qrcode.toDataURL(this.name)
        .then((url) => {
          this.generated = url;
        }).catch((err) => {
          console.log('error', err);
        });
    }
  }

  verify() {
    const ionApp = <HTMLElement>document.getElementsByTagName('ion-app')[0];
    this.qrScanner.prepare()
      .then((status: QRScannerStatus) => {
        if (status.authorized) {
          this.qrScanner.show();
          ionApp.style.display = 'none';
          let scanSub = this.qrScanner.scan().subscribe((text: string) => {
            this.recievedToken = text;
            this.verifyPayment();
            this.qrScanner.hide(); // hide camera preview
            scanSub.unsubscribe(); // stop scanning
            ionApp.style.display = 'block';
          });

        } else if (status.denied) {
          this.qrScanner.openSettings();
        } else {
          this.androidPermissions.requestPermissions([this.androidPermissions.PERMISSION.READ_PHONE_STATE, this.androidPermissions.PERMISSION.CAMERA]);
        }
      })
      .catch((e: any) => console.log('Error is', e));
  }

  verifyPayment() {
    this.presentLoading();
    const data = {
      userId: 'john',
      paymentToken: this.recievedToken
    };

    this.payment.transferPayment(data).subscribe((res: any) => {
      this.presentAlert(`Rs ${res.amount} transferred successfully!`);
    }, (err) => {
      this.presentAlert('Transaction failed!');
    })
  }

  async presentLoading() {
    const loading = await this.loadingController.create({
      message: 'Loading...',
      duration: 5000
    });
    await loading.present();
  }


}
