import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable()
export class PaymentService {
    constructor(private http: HttpClient) {
    }

    transferPayment(data) {
        const strData = JSON.stringify(data);
        return this.http.get(`https://d0fdfaad.ngrok.io/payment/process?req=${btoa(strData)}`);
    }

}