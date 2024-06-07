import { FormControl } from "@angular/forms";

export class Luv2ShopValidators {
  static notOnlyWhitespace(control: FormControl) {
    return !control.value?.trim().length ? { 'notOnlyWhitespace': true } : null;
  }
}
