import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { OKTA_AUTH } from '@okta/okta-angular';
import { OktaAuth } from '@okta/okta-auth-js';
import { Observable, from, lastValueFrom } from 'rxjs';
import { environment } from 'src/environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class AuthInterceptorService implements HttpInterceptor {

  constructor(@Inject(OKTA_AUTH) private oktaAuth: OktaAuth) { }
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return from(this.handleAccess(req, next));
  }
  private async handleAccess(req: HttpRequest<any>, next: HttpHandler): Promise<HttpEvent<any>> {
    // 1. Add access tokens for secured end points

    const endpoint = environment.luv2shopApiUrl + '/orders';
    const securedEndpoints = [endpoint];


    // get access token for matched end points
    if (securedEndpoints.some(url => req.urlWithParams.includes(url))) {
      const accessToken = this.oktaAuth.getAccessToken();
      req = req.clone({
        setHeaders: {
          Authorization: 'Beopenssl req -x509 \
  -out ssl-localhost/localhost.crt \
  -keyout ssl-localhost/localhost.key \
  -newkey rsa:2048 -nodes -sha256 -days 365 \
  -config localhost.confarer ' + accessToken
        }
      });
    }

    return await lastValueFrom(next.handle(req));
    // 2.
  }
}
