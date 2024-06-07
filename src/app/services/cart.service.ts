import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { CartItem } from '../commons/cart-item';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  cartItems: CartItem[] = [];
  totalPrice: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  totalQuantity: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  storage: Storage = sessionStorage;

  constructor() {
    let data = JSON.parse(this.storage.getItem("cartItems")!);

    if (data != null) {
      this.cartItems = data;
    }

    this.computeCartTotals();
  }

  addToCart(itemToAdd: CartItem) {
    // 1. check if cartitems is not null
    let existingCartItem = null
    if (this.cartItems.length) {
      existingCartItem = this.cartItems.find((item) => item.id == itemToAdd.id);
    }

      console.log('\nitemToAdd', itemToAdd);

    if (existingCartItem) {
      existingCartItem.quantity++;
    } else {
      this.cartItems.push(itemToAdd);
    }

    // 2. check if the cart item already exists
    // 3. if yes, then increment the quantity
    // 4. else add it to array
    this.computeCartTotals();
  }

  computeCartTotals() {
    let totalPriceValue = 0;
    let totalQuantityValue = 0;

    console.log('this.cartItems', this.cartItems);

    for (const item of this.cartItems) {
      totalPriceValue += item.quantity * item.unitPrice;
      totalQuantityValue += item.quantity;
    }

    this.totalPrice.next(totalPriceValue);
    this.totalQuantity.next(totalQuantityValue);

    console.log('totalPriceValue', totalPriceValue);
    console.log('totalQuantityValue', totalQuantityValue);
    this.persistCartItems();
  }

  persistCartItems() {
    this.storage.setItem('cartItems', JSON.stringify(this.cartItems));
  }

  decreaseQuantity(cartItem: CartItem) {
    cartItem.quantity--;

    if (cartItem.quantity == 0) {
      this.removeItemFromCart(cartItem);
    } else {
      this.computeCartTotals();
    }
  }

  removeItemFromCart(cartItem: CartItem) {
    const indexToRemove = this.cartItems.findIndex(item => item.id === cartItem.id);

    if (indexToRemove > -1) {
      this.cartItems.splice(indexToRemove, 1);
      this.computeCartTotals();
    }
  }
}
