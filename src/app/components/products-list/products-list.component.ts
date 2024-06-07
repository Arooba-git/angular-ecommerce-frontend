import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CartItem } from 'src/app/commons/cart-item';
import { Product } from 'src/app/commons/product';
import { CartService } from 'src/app/services/cart.service';
import { ProductService } from 'src/app/services/product.service';

@Component({
  selector: 'app-products-list',
  templateUrl: './products-list.component.html',
  styleUrls: ['./products-list.component.css']
})

export class ProductsListComponent {
  products: Product[] = [];
  currentCategoryId: number = 1;
  searchMode: boolean = false;

  pageNumber: number = 1;
  pageSize: number = 5;
  totalElements = 0;
  previousCategoryId: number = 1;
  previousKeyword: string = "";

  ngOnInit() {
    this.route.paramMap.subscribe(() => {
      this.listProducts();
    });
  }

  constructor(private productService: ProductService, private cartService: CartService, private route: ActivatedRoute) {}

  listProducts() {
    const searchMode = this.route.snapshot.paramMap.has('keyword');
    if (searchMode) {
      this.handleSearchProducts();

    } else {
      this.handleListProducts();
    }
  }

  handleListProducts() {
    if (this.route.snapshot.paramMap.has('id')) {
      this.currentCategoryId = +this.route.snapshot.paramMap.get('id')!;
    } else {
      this.currentCategoryId = 1;
    }

    if(this.previousCategoryId !== this.currentCategoryId) {
      this.pageNumber = 1;
      this.previousCategoryId = this.currentCategoryId;
    }

    this.productService.getPaginatedProducts(this.currentCategoryId, this.pageNumber - 1, this.pageSize).subscribe(
      this.processResults());
  }

  handleSearchProducts() {
    const keyword = this.route.snapshot.paramMap.get('keyword')!;

    if (this.previousKeyword !== keyword) {
      this.pageNumber = 1;
      this.previousKeyword  = keyword;
    }

    this.productService.getPaginatedSearchProducts(keyword, this.pageNumber, this.pageSize).subscribe(this.processResults());
  }

  updatePageSize(selectedPagedSize: string) {
    this.pageSize = +selectedPagedSize;
    this.pageNumber = 1;
    this.listProducts();
  }

  processResults() {
    return (data: any) => {
      this.products = data._embedded.products;
      this.pageNumber = data.page.number + 1;
      this.pageSize = data.page.size;
      this.totalElements = data.page.totalElements;
    }
  }

  addToCart(product: Product) {
    const item = new CartItem(product);
    this.cartService.addToCart(item);
  }
}
