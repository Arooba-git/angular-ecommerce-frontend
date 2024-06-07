import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CartItem } from 'src/app/commons/cart-item';
import { Product } from 'src/app/commons/product';
import { CartService } from 'src/app/services/cart.service';
import { ProductService } from 'src/app/services/product.service';

@Component({
  selector: 'app-product-details',
  templateUrl: './product-details.component.html',
  styleUrls: ['./product-details.component.css']
})
export class ProductDetailsComponent {
  product?: Product;

  constructor(
    private productService: ProductService,
    private route: ActivatedRoute,
    private cartService: CartService
    ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(() => {
      this.handleProductDetails();
    });
  }

  handleProductDetails() {
    const productID: number = +this.route.snapshot.paramMap.get('id')!;

    console.log('productID', productID);
    this.productService.getProduct(productID).subscribe((data) => {
      console.log("data: ", data);
      this.product = data;
    });
  }

  addToCart(productToAdd: Product) {
    const newItem = new CartItem(productToAdd);
    this.cartService.addToCart(newItem);
  }
}
