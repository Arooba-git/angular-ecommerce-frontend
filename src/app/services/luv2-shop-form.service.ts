import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { Country } from '../commons/country';
import { State } from '../commons/state';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class Luv2ShopFormService {
  private countriesURL = environment.luv2shopApiUrl + '/countries';
  private statesURL = environment.luv2shopApiUrl + '/states';
  constructor(private httpClient: HttpClient) { }

  getCountries(): Observable<Country[]> {
    return this.httpClient.get<GetResponseCountries>(this.countriesURL).pipe(map(response => response._embedded.countries));
  }

  getStates(countryCode: string): Observable<State[]> {
    const searchStateURL = `${this.statesURL}/search/findByCountryCode?code=${countryCode}`;
    return this.httpClient.get<GetResponseStates>(searchStateURL).pipe(map(response => response._embedded.states));
  }

  getCreditCardMonths(startMonth: number): Observable<number[]> {
    const months: number[] = [];
    for (let month = startMonth; month <= 12; month++) {
      months.push(month);
    }

    return of(months);
  }

  getCreditCardYears() {
    const years: number[] = [];
    const startYear: number = new Date().getFullYear();
    const endYear = startYear + 10;

    for (let year = startYear; year<= endYear; year++) {
      years.push(year);
    }

    return of(years);
  }
}

interface GetResponseCountries {
  _embedded: {
    countries: Country[];
  }
}

interface GetResponseStates {
  _embedded: {
    states: State[];
  }
}
