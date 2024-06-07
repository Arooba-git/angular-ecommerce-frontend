import { Component, Inject } from '@angular/core';
import { OKTA_AUTH } from '@okta/okta-angular';
import { OktaAuth } from '@okta/okta-auth-js';
import OktaSignIn from '@okta/okta-signin-widget';
import myAppConfig from 'src/app/config/my-app-config';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  oktaSignin: any;

  constructor(@Inject(OKTA_AUTH) private oktaAuth: OktaAuth) {
    console.log('myAppConfig.oidc.issuer.split', myAppConfig.oidc.issuer.split('/oauth2')[0]);
    console.log('myAppConfig.oidc.redirectUri', myAppConfig.oidc.redirectUri);
    this.oktaSignin = new OktaSignIn({
      logo: 'assets/images/logo.png',
      baseUrl: myAppConfig.oidc.issuer.split('/oauth2')[0],
      clientId: myAppConfig.oidc.clientId,
      redirectUri: myAppConfig.oidc.redirectUri,
      authParams: {
        pkce: true,
        issuer: myAppConfig.oidc.issuer,
        scopes: myAppConfig.oidc.scopes
      }
    });
  }

  ngOnInit(): void {
    this.oktaSignin.remove();

    console.log('here');
    this.oktaSignin.renderEl(
      {el: '#okta-sign-in-widget'},
      (response: any) => {
        console.log('response', response);
        if (response.status == 'SUCCESS') {
          console.log('this.oktaAuth', this.oktaAuth);
          this.oktaAuth.signInWithRedirect();
        }
      },
      (error: any) => {
        console.log('error', error);
        throw error;
      }
    );
  }
}
