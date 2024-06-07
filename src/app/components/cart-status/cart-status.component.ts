import { Component } from '@angular/core';
import { CartService } from 'src/app/services/cart.service';

@Component({
  selector: 'app-cart-status',
  templateUrl: './cart-status.component.html',
  styleUrls: ['./cart-status.component.css']
})
export class CartStatusComponent {
  totalPriceValue = 0;
  totalQuantityValue = 0;
  constructor(private cartService: CartService) {}

  ngOnInit() {
    this.updateCartStatus();
  }

  updateCartStatus() {
    this.cartService.totalPrice.subscribe(data => {
      this.totalPriceValue = data;
    });

    this.cartService.totalQuantity.subscribe(data => {
      this.totalQuantityValue = data;
    });
  }
}
