import { Component, OnInit } from '@angular/core';
import { OrderHistory } from 'src/app/commons/order-history';
import { OrderHistoryService } from 'src/app/services/order-history.service';

@Component({
  selector: 'app-order-history',
  templateUrl: './order-history.component.html',
  styleUrls: ['./order-history.component.css']
})
export class OrderHistoryComponent implements OnInit {
  orderHistoryList: OrderHistory[] = [];
  storage: Storage =  sessionStorage;
  constructor(private orderHistoryService: OrderHistoryService) {

  }

  ngOnInit(): void {
    const email = JSON.parse(this.storage.getItem('email')!);
    this.orderHistoryService.getOrderHistory(email!).subscribe(data => {
      this.orderHistoryList = data._embedded.orders;
    })

    console.log('this.orderHistoryList', this.orderHistoryList);
  }
}
