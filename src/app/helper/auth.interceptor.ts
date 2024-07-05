import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { AuthService } from '../auth.service';
import { CookieService } from 'ngx-cookie-service';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(
    private router: Router,
    private authService: AuthService, 
    private cookieService:CookieService,
    ) {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const accessToken = this.cookieService.get('auth_key');
    //const token = this.cookieService.get('auth_key');
    if(accessToken){
      console.log('Token has been retrieved');
      request = request.clone({
        setHeaders: {
          Authorization:`Bearer ${accessToken}`,
        },
      });
    }

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401 || error.status === 403) {
          // Token expired, attempt to refresh
          console.log('Access token expired');
          const refreshToken = this.cookieService.get('refresh_token');
          if(refreshToken){
            return this.authService.refreshToken(refreshToken).pipe(
              switchMap((newTokens: any) => {
                if (newTokens) {
                  this.cookieService.set('auth_key', newTokens.accessToken);
  
                  // Console log the new access token
                  console.log('New access token:', newTokens.accessToken);
                  
                  request = request.clone({
                    setHeaders: {
                      Authorization: `Bearer ${newTokens.accessToken}`
                    }
                  });
                  return next.handle(request);
                }
                return throwError(error);
              }),
              catchError(error => {
                //when refresh has expired
                this.authService.logout();
                this.router.navigate(['/login']);
                return throwError(error);
              })
            )
          }else{
            //refresh not found
            this.authService.logout();
            this.router.navigate(['/login']);
            return throwError(error);
          }
        } else{
          // Pass the error along to be handled by the calling code
          return throwError(error);
        }
        
      })
    );
  }
}
