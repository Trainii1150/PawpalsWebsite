import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = `http://localhost:3000/api/admin`; // Base URL of your API

  constructor(private http: HttpClient) { }

  // Storage Item Methods
  addItemToStorage(userId: number, itemId: number, quantity: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/add-storeitem`, { userId, itemId, quantity });
  }

  updateStorageItem(storageId: number, userId: number, itemId: number, quantity: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/update-storeitem`, { storageId, userId, itemId, quantity });
  }

  deleteItemFromStorage(storageId: number, userId: number, itemId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/delete-storeitem`, { body: { storageId, userId, itemId } });
  }

  // Item Methods
  createItem(item_name: string, description: string, item_type: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/create-item`, { item_name, description, item_type });
  }

  updateItem(item_id: number, item_name: string, description: string, item_type: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/update-item`, { item_id, item_name, description, item_type });
  }

  deleteItem(item_id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/delete-item`, { body: { item_id } });
  }

  // User Pets Methods
  createUserPet(userId: number, petId: number, petName: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/create-userpets`, { userId, petId, petName });
  }

  updateUserPet(userPetId: number, petId: number, petName: string, hungerLevel: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/update-userpets`, { userPetId, petId, petName, hungerLevel });
  }

  deleteUserPet(userPetId: number, userId: number, petId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/delete-userpets`, { body: { userPetId, userId, petId } });
  }

  // Pet Methods
  addPet(petName: string, description: string, petType: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/add-pets`, { petName, description, petType });
  }

  updatePet(petId: number, petName: string, description: string, petType: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/update-pets`, { petId, petName, description, petType });
  }

  deletePet(petId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/delete-pets`, { body: { petId } });
  }

  // User Methods
  updateUser(userId: number, newUsername: string, newPassword: string, newRole: string, newAmountcoins: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/update-user`, { userId, newUsername, newPassword, newRole, newAmountcoins });
  }

  deleteUser(userid: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/delete-user`, { body: { userid } });
  }
}