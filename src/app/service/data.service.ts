import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  constructor(private http: HttpClient) { }

  getActivityCoins(): Observable<any[]> {
    return this.http.get<any[]>('/api/activity-coins');
  }
}