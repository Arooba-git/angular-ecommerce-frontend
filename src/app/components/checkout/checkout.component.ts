import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Country } from 'src/app/commons/country';
import { Order } from 'src/app/commons/order';
import { OrderItem } from 'src/app/commons/order-item';
import { PaymentInfo } from 'src/app/commons/payment-info';
import { Purchase } from 'src/app/commons/purchase';
import { State } from 'src/app/commons/state';
import { CartService } from 'src/app/services/cart.service';
import { CheckoutService } from 'src/app/services/checkout.service';
import { Luv2ShopFormService } from 'src/app/services/luv2-shop-form.service';
import { Luv2ShopValidators } from 'src/app/validators/luv2-shop-validators';
import { environment } from 'src/environments/environment.development';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent {
  checkoutFormGroup!: FormGroup;
  totalQuantity: number = 0;
  totalPrice: number = 0;
  creditCardYears: number[] = [];
  creditCardMonths: number[] = [];
  countries: Country[] = [];
  shippingAddressStates: State[] = [];
  billingAddressStates: State[] = [];
  storage: Storage = sessionStorage;
  stripe = Stripe(environment.stripePublishableKey);
  paymentInfo: PaymentInfo = new PaymentInfo();
  displayError: any = "";
  cardElement: any;
  isDisabled: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private shopService: Luv2ShopFormService,
    private cartService: CartService,
    private checkoutService: CheckoutService,
    private router: Router) {
  }

  ngOnInit() {
    this.setupStripePaymentForm();
    this.shopService.getCountries().subscribe(data => {
      this.countries = data;
    })

    const customerEmail = JSON.parse(this.storage.getItem('email')!);

    this.checkoutFormGroup = this.formBuilder.group({
      customer: this.formBuilder.group({
        firstName: new FormControl('', [Validators.required, Validators.minLength(2), Luv2ShopValidators.notOnlyWhitespace]),
        lastName: new FormControl('', [Validators.required, Validators.minLength(2), Luv2ShopValidators.notOnlyWhitespace]),
        email: new FormControl(customerEmail, [Validators.required, Validators.pattern('^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$'), Luv2ShopValidators.notOnlyWhitespace])
      }),
      shippingAddress: this.formBuilder.group({
        street: new FormControl('', [Validators.required, Validators.minLength(2), Luv2ShopValidators.notOnlyWhitespace]),
        city: new FormControl('', [Validators.required, Validators.minLength(2), Luv2ShopValidators.notOnlyWhitespace]),
        state: new FormControl('', [Validators.required]),
        country: new FormControl('', [Validators.required]),
        zipcode: new FormControl('', [Validators.required, Validators.minLength(2), Luv2ShopValidators.notOnlyWhitespace]),
      }),
      billingAddress: this.formBuilder.group({
        street: new FormControl('', [Validators.required, Validators.minLength(2), Luv2ShopValidators.notOnlyWhitespace]),
        city: new FormControl('', [Validators.required, Validators.minLength(2), Luv2ShopValidators.notOnlyWhitespace]),
        state: new FormControl('', [Validators.required]),
        country: new FormControl('', [Validators.required]),
        zipcode: new FormControl('', [Validators.required, Validators.minLength(2), Luv2ShopValidators.notOnlyWhitespace]),
      }),
      creditCard: this.formBuilder.group({

      }),
    })
    this.reviewCartDetails();
  }
  setupStripePaymentForm() {
    const elements = this.stripe.elements();
    this.cardElement = elements.create('card', {hidePostalCode: true});
    this.cardElement.mount('#card-element');
    this.cardElement.on('change', (event: any) => {
      console.log("\n\nevent", event);
      this.displayError = document.getElementById('card-errors');
      if (event.complete) {
        this.displayError.textContent = "";
        this.isDisabled = false;
      } else if (event.error) {
        this.displayError.textContent = event.error?.message;
      }
    })
  }

  reviewCartDetails() {
    this.cartService.totalPrice.subscribe(data => {
      this.totalPrice = data;
    })

    this.cartService.totalQuantity.subscribe(data => {
      this.totalQuantity = data;
    })
  }

  onSubmit() {
    console.log(this.checkoutFormGroup.get('customer')?.value);

    if (this.checkoutFormGroup.invalid) {
      this.checkoutFormGroup.markAllAsTouched();
      return;
    }

    //1. Set up order
    let order = new Order();

    order.totalPrice = this.totalPrice;
    order.totalQuantity = this.totalQuantity;
    //2. Create cart items

    //3. Create order items from cart items
    let orderItems = this.cartService.cartItems.map(item => new OrderItem(item));
    //4. Setup purchase
    let purchase = new Purchase();

    purchase.customer = this.checkoutFormGroup.controls['customer'].value;

    //5. Populate purchase with customer, shipping address, billing address, orderitems
    purchase.shippingAddress = this.checkoutFormGroup.controls['shippingAddress'].value;
    const shippingState = JSON.parse(JSON.stringify(purchase.shippingAddress.state));
    const shippingCountry = JSON.parse(JSON.stringify(purchase.shippingAddress.country));
    purchase.shippingAddress.state = shippingState.name;
    purchase.shippingAddress.country = shippingCountry.name;

    purchase.billingAddress = this.checkoutFormGroup.controls['billingAddress'].value;
    const billingState = JSON.parse(JSON.stringify(purchase.billingAddress.state));
    const billingCountry = JSON.parse(JSON.stringify(purchase.billingAddress.country));
    purchase.billingAddress.state = billingState.name;
    purchase.billingAddress.country = billingCountry.name;

    purchase.order = order;
    purchase.orderItems = orderItems;

    // computer payment info
    this.paymentInfo.amount = Math.round(this.totalPrice * 100);
    this.paymentInfo.currency = "USD";
    this.paymentInfo.receiptEmail = purchase.customer.email;

    //6. if valid card details, then create payment intent , place confirm the payment order
    console.log('this.displayError', this.displayError);
    console.log('this.checkoutFormGroup.invalid', this.checkoutFormGroup.invalid);

    if (!this.displayError.textContent && !this.checkoutFormGroup.invalid) {
      this.isDisabled = true;
      console.log('here1');
      this.checkoutService.createPaymentIntent(this.paymentInfo).subscribe((paymentIntentResponse) => {
        this.stripe.confirmCardPayment(paymentIntentResponse.client_secret, {
          payment_method: {
            card: this.cardElement,
            billing_details: {
              email: purchase.customer.email,
              name: `${purchase.customer.firstName} ${purchase.customer.lastName}`,
              address: {
                line1: purchase.billingAddress.street,
                city: purchase.billingAddress.city,
                state: purchase.billingAddress.state,
                postal_code: purchase.billingAddress.zipCode,
                country: this.billingAddressCountry?.value.code
              }
            }
          }
        }, {handleActions: false})
        .then((result: any) => {
          if (result.error) {
            alert(result.error.message);
            this.isDisabled = true;
          } else {
            this.checkoutService.placeOrder(purchase).subscribe({
              next: (response) => {
                alert("Order successful: You order tracking number is" + response.orderTrackingNumber);
                this.resetCart();
                this.cartService.persistCartItems();
                this.isDisabled = true;
              },
              error: (err) => {
                alert(err.message)
                this.isDisabled = true;
              }
            });
          }
        })
      })
    } else {
      this.checkoutFormGroup.markAllAsTouched();
      return;
    }
  }

  get firstName() {
    return this.checkoutFormGroup.get('customer.firstName');
  }
  get lastName() {
    return this.checkoutFormGroup.get('customer.lastName');
  }
  get email() {
    return this.checkoutFormGroup.get('customer.email');
  }

  get shippingAddressStreet() {
    return this.checkoutFormGroup.get('shippingAddress.street');
  }
  get shippingAddressCity() {
    return this.checkoutFormGroup.get('shippingAddress.city');
  }
  get shippingAddressState() {
    return this.checkoutFormGroup.get('shippingAddress.state');
  }
  get shippingAddressZipcode() {
    return this.checkoutFormGroup.get('shippingAddress.zipcode');
  }
  get shippingAddressCountry() {
    return this.checkoutFormGroup.get('shippingAddress.country');
  }

  get billingAddressStreet() {
    return this.checkoutFormGroup.get('billingAddress.street');
  }
  get billingAddressCity() {
    return this.checkoutFormGroup.get('billingAddress.city');
  }
  get billingAddressState() {
    return this.checkoutFormGroup.get('billingAddress.state');
  }
  get billingAddressZipcode() {
    return this.checkoutFormGroup.get('billingAddress.zipcode');
  }
  get billingAddressCountry() {
    return this.checkoutFormGroup.get('billingAddress.country');
  }

  get creditCardType() {
    return this.checkoutFormGroup.get('creditCard.cardType');
  }
  get creditCardNameOnCard() {
    return this.checkoutFormGroup.get('creditCard.nameOnCard');
  }
  get creditCardNumber() {
    return this.checkoutFormGroup.get('creditCard.cardNumber');
  }
  get creditCardSecurityCode() {
    return this.checkoutFormGroup.get('creditCard.securityCode');
  }

  copyShippingAddressToBilling(event: Event) {
    const target = <HTMLInputElement>event?.target;
    if (target.checked) {
      this.checkoutFormGroup.controls.billingAddress
        .setValue(this.checkoutFormGroup.controls.shippingAddress.value);

      this.billingAddressStates = this.shippingAddressStates;
    } else {
      this.checkoutFormGroup.controls.billingAddress.reset();
      this.billingAddressStates = [];
    }
  }

  handleExpiryMonthsAndYears() {
    const creditCardForm = this.checkoutFormGroup.get('creditCard');
    const selectedExpirationYear = Number(creditCardForm?.value.expirationYear);
    const currentYear = new Date().getFullYear();

    let startMonth: number;

    if (currentYear === selectedExpirationYear) {
      startMonth = new Date().getMonth() + 1;
    } else {
      startMonth = 1;
    }

    this.shopService.getCreditCardMonths(startMonth).subscribe(data => {
      this.creditCardMonths = data;
    });
  }

  getStates(formGroupName: string) {
    const formGroup = this.checkoutFormGroup.get(formGroupName);
    const countryCode = formGroup?.value.country.code

    this.shopService.getStates(countryCode).subscribe(data => {
      if (formGroupName == 'shippingAddress') {
        this.shippingAddressStates = data;
      } else {
        this.billingAddressStates = data;
      }

      formGroup?.get('state')?.setValue(data[0]);
    });
  }

  resetCart() {
    // reset cart and form and navigate back to products
    this.cartService.cartItems = [];
    this.cartService.totalPrice.next(0);
    this.cartService.totalQuantity.next(0);

    this.checkoutFormGroup.reset();
    this.router.navigateByUrl("/products");
  }
}
