import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private UrlApi = `http://localhost:3000/api/user`; // Base URL of your API
  constructor(private http: HttpClient) { }

  // Method to buy an item
  buyItem(uid: any, item_id: any) {
    return this.http.post(`${this.UrlApi}/buy-item`, { uid, item_id });
  }

  // Method to feed a pet
  feedPet(uid: string, petId: number, foodValue: number, itemId: number) {
    return this.http.post(`${this.UrlApi}/feed-pet`, { uid, petId, foodValue, itemId });
  }

  // Method to randomize a pet
  randomizePet(uid: string) {
    return this.http.post(`${this.UrlApi}/randomize-pet`, { uid });
  }

  saveUserDecoration(uid: string, decoration: { pet: string | undefined; background: string | undefined }) {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });
    return this.http.post(`${this.UrlApi}/save-decorations`, { userId: uid, decoration }, { headers });
  }
  
  
}
