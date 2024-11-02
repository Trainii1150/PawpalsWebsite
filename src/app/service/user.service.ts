import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private UrlApi = `http://localhost:3000/api/user`; // Base URL of your API

  constructor(private http: HttpClient, private cookieService: CookieService) { }

  // ฟังก์ชันสร้าง header พร้อมโทเค็น
  private createAuthHeaders(): HttpHeaders {
    const token = this.cookieService.get('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    });
  }

  buyItem(uid: any, item_id: any) {
    return this.http.post(
      `${this.UrlApi}/buy-item`, 
      { uid, item_id },
      { headers: this.createAuthHeaders() } // เพิ่ม header
    );
  }

  // Method to feed a pet
  feedPet(uid: string, petId: number, foodValue: number, itemId: number) {
    return this.http.post(
      `${this.UrlApi}/feed-pet`,
      { uid, petId, foodValue, itemId },
      { headers: this.createAuthHeaders() } // เพิ่ม header
    );
  }

  randomizePet(uid: string) {
    return this.http.post(
      `${this.UrlApi}/randomize-pet`,
      { uid },
      { headers: this.createAuthHeaders() } // เพิ่ม header
    );
  }

  saveUserDecoration(uid: string, decoration: { pet: string | undefined; background: string | undefined }) {
    return this.http.post(
      `${this.UrlApi}/save-decorations`,
      { userId: uid, decoration },
      { headers: this.createAuthHeaders() } // เพิ่ม header
    );
  }
}
