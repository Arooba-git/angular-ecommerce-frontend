import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { OrderHistory } from '../commons/order-history';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class OrderHistoryService {
  constructor(private httpClient: HttpClient) { }
  orderURL: string = environment.luv2shopApiUrl + "/orders"
  getOrderHistory(customerEmail: string): Observable<GetResponseOrderHistory> {
    const orderHistoryURL = `${this.orderURL}/search/findByCustomerEmailOrderByDateCreatedDesc?email=${customerEmail}`;
    console.log("orderHistoryURL", orderHistoryURL);
    return this.httpClient.get<GetResponseOrderHistory>(orderHistoryURL);
  }
}

interface GetResponseOrderHistory {
  _embedded: {
    orders: OrderHistory[]
  }
}
