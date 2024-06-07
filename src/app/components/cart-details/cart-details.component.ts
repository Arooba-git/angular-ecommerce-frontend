import { Component } from '@angular/core';
import { CartItem } from 'src/app/commons/cart-item';
import { CartService } from 'src/app/services/cart.service';

@Component({
  selector: 'app-cart-details',
  templateUrl: './cart-details.component.html',
  styleUrls: ['./cart-details.component.css']
})
export class CartDetailsComponent {
  cartItems: CartItem[] = [];
  totalPriceValue: number = 0;
  totalQuantityValue: number = 0;

  constructor(private cartService: CartService) {}

  ngOnInit() {
    this.listCartDetails();
  }

  listCartDetails() {
    this.cartItems = this.cartService.cartItems;
    this.cartService.totalPrice.subscribe(data => {
      this.totalPriceValue = data;
    });

    this.cartService.totalQuantity.subscribe(data => {
      this.totalQuantityValue = data;
    });

    this.cartService.computeCartTotals();
  }

  increaseQuantity(cartItem: CartItem) {
    this.cartService.addToCart(cartItem);
  }

  decreaseQuantity(cartItem: CartItem) {
    this.cartService.decreaseQuantity(cartItem);
  }

  remove(itemToRemove: CartItem) {
    this.cartService.removeItemFromCart(itemToRemove);
  }
}
