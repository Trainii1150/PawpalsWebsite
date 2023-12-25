import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private UrlApi = 'http://localhost:3000/api/user'; //connect data api from server node
  
  constructor(private http:HttpClient) {}
  register(username: string,email: string ,password: string) {
    return this.http.post(`${this.UrlApi}/register`, { username,email, password });
  }
  login(email: string,password: string) {
    return this.http.post(`${this.UrlApi}/login`, { email, password });
  }
  
}
