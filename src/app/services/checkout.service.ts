import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Purchase } from '../commons/purchase';
import { Observable } from 'rxjs';
import { PaymentInfo } from '../commons/payment-info';
import { environment } from 'src/environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class CheckoutService {
  private purchaseUrl = environment.luv2shopApiUrl + '/checkout/purchase';
  private paymentIntentURL = environment.luv2shopApiUrl + '/checkout/payment-intent';
  constructor(private httpClient: HttpClient) {
  }

  placeOrder(purchase: Purchase): Observable<any> {
    console.log('\npurchase', purchase);
    return this.httpClient.post<Purchase>(this.purchaseUrl, purchase);
  }

  createPaymentIntent(paymentInfo: PaymentInfo): Observable<any> {
    return this.httpClient.post<PaymentInfo>(this.paymentIntentURL, paymentInfo);
  }
}
