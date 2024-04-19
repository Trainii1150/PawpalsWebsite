import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environments } from './environments/environments';

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
  
  constructor(private http:HttpClient) {}
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
  isloggedin(){
    return !!localStorage.getItem('auth_key');
  }
  setLocalStorage(resObject:any){
    localStorage.setItem('auth_key',resObject.token);
  }
  logout(){
    localStorage.removeItem('auth_key');
  }
  fetchuserdata(){
    return this.http.get(`${this.UrlApi}/data`);
  }
}
