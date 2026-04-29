import { ApplicationConfig } from '@angular/core'; // Removed the broken import
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAuth0 } from '@auth0/auth0-angular';

import { routes } from './app.routes';
import { authInterceptor } from './auth.interceptor'; 

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    
    // HTTP Client with your secure cookies
    provideHttpClient(
      withInterceptors([authInterceptor])
    ),

    // Your Auth0 Configuration
    provideAuth0({
      domain: '', 
      clientId: '', 
      authorizationParams: {
        redirect_uri: window.location.origin
      }
    })
  ]
};