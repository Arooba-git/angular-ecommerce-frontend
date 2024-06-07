import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map} from 'rxjs/operators';
import { Product } from '../commons/product';
import { ProductCategory } from '../commons/product-category';
import { environment } from 'src/environments/environment.development';


@Injectable({
  providedIn: 'root'
})
export class ProductService {
  constructor(private httpClient: HttpClient) {}

  private baseURL = environment.luv2shopApiUrl + '/products';
  private categoryURL = environment.luv2shopApiUrl + '/product-category';

  getProductCategories(): Observable<ProductCategory[]> {
    return this.httpClient.get<GetResponseProductCategories>(this.categoryURL).pipe(map
      (response => {
        return response._embedded.productCategory;
      })
    );
  }

  getProductList(categoryID: number): Observable<Product[]> {
    const searchURL = `${this.baseURL}/search/findByCategoryId?id=${categoryID}`
    return this.getProducts(searchURL);
  }

  getPaginatedProducts(categoryID: number, pageNumber: number, pageSize: number): Observable<GetResponseProducts> {
    const searchURL = `${this.baseURL}/search/findByCategoryId?id=${categoryID}&page=${pageNumber}&size=${pageSize}`
    return this.httpClient.get<GetResponseProducts>(searchURL);
  }

  getPaginatedSearchProducts(keyword: string, pageNumber: number, pageSize: number): Observable<GetResponseProducts> {
    const searchURL = `${this.baseURL}/search/findByNameContaining?name=${keyword}&page=${pageNumber -1}&size=${pageSize}`;
    return this.httpClient.get<GetResponseProducts>(searchURL);
  }

  getSearchProducts(keyword: string): Observable<Product[]> {
    const searchURL = `${this.baseURL}/search/findByNameContaining?name=${keyword}`
    return this.getProducts(searchURL);
  }

  private getProducts(searchURL: string): Observable<Product[]> {
    return this.httpClient.get<GetResponseProducts>(searchURL).pipe(map(
      response => response._embedded.products
    ));
  }

  getProduct(productID: number):Observable<Product> {
    const productURL = `${this.baseURL}/${productID}`;
    return this.httpClient.get<Product>(productURL);
  }
}

interface GetResponseProducts {
  _embedded: {
    products: Product[],
  },
  page: {
    totalPages: number, // total pages available
    size: number, // size of current page
    number: number, // current page number
    totalElements: number
  }
}

interface GetResponseProductCategories {
  _embedded: {
    productCategory: ProductCategory[];
  }
}
