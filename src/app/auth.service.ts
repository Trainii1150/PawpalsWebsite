import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environments } from './environments/environments';
import { CookieService } from 'ngx-cookie-service';
import { jwtDecode } from "jwt-decode";

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private UrlApi = environments.apiUrl; //connect data api from server node
  /*private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('auth_key')}`
    })
  };*/
  
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
  }
  validateResetToken(token: string) {
    return this.http.post(`${this.UrlApi}/validate-resetpasstoken`, { token });
  }
  validateNewpassword(email : string ,password : string) {
    return this.http.post<boolean>(`${this.UrlApi}/validate-newpassword`, { email, password });
  }
  resetpassword(email: string, password: string) {
    return this.http.post(`${this.UrlApi}/resetpassword`,{ email, password });
  };
  isloggedin(){
    return !!this.cookieService.get('auth_key');
    //return !!localStorage.getItem('auth_key');
  }
  setLocalStorage(resObject:any){
    const tokenPayload: any = jwtDecode(resObject.token);
    const exp = tokenPayload.exp*1000;
    console.log(exp.toString());
    this.cookieService.set('auth_key',resObject.token,exp);
    this.cookieService.set('email',resObject.user);
    /*localStorage.setItem('auth_key',resObject.token);
    localStorage.setItem('auth_email',resObject.user);*/
  }

  setExtensionsToken(email: any) {
    return this.http.post(`${this.UrlApi}/extensionsToken`, { email });
  }

  logout(){
    this.cookieService.deleteAll();
    //localStorage.removeItem('auth_key');
  }
  fetchuserdata(){
    return this.http.get(`${this.UrlApi}/data`);
  }

  checkEmailNotTaken(email: string) {
    return this.http.post<boolean>(`${this.UrlApi}/check-email`, { email });
  }
}