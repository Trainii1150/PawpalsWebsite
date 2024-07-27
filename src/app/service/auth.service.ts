import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environments } from '../environments/environments';
import { CookieService } from 'ngx-cookie-service';
import { jwtDecode } from "jwt-decode";

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private UrlApi = environments.apiAuthUrl; //connect data api from server node
  
  constructor(private http:HttpClient,private cookieService:CookieService) {}

  register(username: string,email: string ,password: string) {
    return this.http.post(`${this.UrlApi}/register`, { username,email, password });
  }

  sendVerifyEmail(email: string) {
    return this.http.post(`${this.UrlApi}/send-verifyemail`, { email });
  }

  verifyEmail(token: string){
    return this.http.post(`${this.UrlApi}/verifyemail`,{token});
  }

  login(email: string,password: string) {
    return this.http.post(`${this.UrlApi}/login`, { email, password });
  }

  forgetpassword(email: string){
    return this.http.post(`${this.UrlApi}/sent-resetpassword`,{email});
  };

  validateResetToken(token: string) {
    return this.http.post(`${this.UrlApi}/validate-resetpasstoken`, { token });
  };

  validateNewpassword(email : string ,password : string) {
    return this.http.post<boolean>(`${this.UrlApi}/validate-newpassword`, { email, password });
  };

  resetpassword(email: string, password: string) {
    return this.http.post(`${this.UrlApi}/resetpassword`,{ email, password });
  };

  isloggedin(){
    return !!this.cookieService.get('token');
  };

  setLocalStorage(resObject:any){
    const tokenPayload: any = jwtDecode(resObject.accessToken);
    const exp = tokenPayload.exp*1000;
    this.cookieService.set('token',resObject.accessToken,exp);
    this.cookieService.set('refresh_token', resObject.refreshToken);
    this.cookieService.set('uid',resObject.uid);
  };

  getRole(){
    const token = this.cookieService.get('token');
    if(token){
      const decodeuserrole:any = jwtDecode(token);
      return decodeuserrole.role;
    }
    return null;
  };

  setExtensionsToken(email: any) {
    return this.http.post(`${this.UrlApi}/extensionsToken`, { email });
  }

  refreshToken(refreshToken: any){
    return this.http.post(`${this.UrlApi}/refresh-token`, { refreshToken });
  }
  
  logout(){
    this.cookieService.deleteAll();
  }

  checkEmailNotTaken(email: string) {
    return this.http.post<boolean>(`${this.UrlApi}/check-email`, { email });
  }

}