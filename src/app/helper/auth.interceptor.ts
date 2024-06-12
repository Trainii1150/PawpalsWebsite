import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../auth.service';
import { CookieService } from 'ngx-cookie-service';
import { jwtDecode } from "jwt-decode";
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(
    private router: Router,
    private authService: AuthService, 
    private cookieService:CookieService
    
    ) {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const token = this.cookieService.get('auth_key');
    if (token) {
      const tokenPayload: any = jwtDecode(token);
      const expdate = new Date(tokenPayload.exp*1000);
       // Check if the token has expired
      if(expdate <= new Date()){
        // Token has expired, log out the user
        this.authService.logout();
        this.router.navigate(['/login']);
        console.log('Token expired');
      } else {
        console.log('Token has been retrieved');
        request = request.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`,  
          },
        });
      }

      /*request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      });*/
    }

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401 || error.status === 403) {
          // Unauthorized error (token expired or invalid)
          // Log out the user or perform any other action
          this.authService.logout();
          // Redirect to the login page or show a message to the user
          this.router.navigate(['/login']);
          console.log('Token expired or invalid.');
        }
        // Pass the error along to be handled by the calling code
        return throwError(error);
      })
    );
  }
}
