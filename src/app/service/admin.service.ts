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
  createItem(itemData : any): Observable<any> {
    return this.http.post(`${this.apiUrl}/create-item`, itemData);
  }

  updateItem(itemData : any): Observable<any> {
    return this.http.put(`${this.apiUrl}/update-item`, itemData);
  }

  deleteItem(item_id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/delete-item`, { body: { item_id } });
  }

  // User Pets Methods
  createUserPet(userId: any, petId: number, petName: string, path : any): Observable<any> {
    return this.http.post(`${this.apiUrl}/create-userpets`, { userId, petId, petName,path });
  }

  updateUserPet(userPetId: number, petId: number, petName: string, hungerLevel: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/update-userpets`, { userPetId, petId, petName, hungerLevel });
  }

  deleteUserPet(userPetId: number, userId: number, petId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/delete-userpets`, { body: { userPetId, userId, petId } });
  }

  // Pet Methods
  addPet(petData : any): Observable<any> {
    return this.http.post(`${this.apiUrl}/add-pets`, petData);
  }

  updatePet(petData : any): Observable<any> {
    return this.http.put(`${this.apiUrl}/update-pets`, petData);
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

  banUser(userId: number, shouldBan: boolean): Observable<any> {
    return this.http.put(`${this.apiUrl}/set-userban`, { userId, ban: shouldBan });
  }

  getAllUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/users`);
  }

  getAllItems(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/items`);
  }

  getAllPets(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/pets`);
  }

  getAllUserPets(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/user-pets`);
  }

  getAllStorage(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/storage`);
  }

 // Fetch all store items
  getStoreItems(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/store-items`);
  }

  // Add a new store item
  addStoreItem(itemId: number, price: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/add-store-item`, { itemId, price });
  }

  // Update existing store item
  updateStoreItem(storeItemId: number, itemId: number, price: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/update-store-item`, { storeItemId, itemId, price });
  }

  // Delete store item
  deleteStoreItem(storeItemId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/delete-store-item`, { body: { storeItemId } });
  }
  getActivities(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/activities`);
  }

  // Add a new activity
  addActivity(activityData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/add-activity`, activityData);
  }

  // Update an existing activity
  updateActivity(activityId: number, activityData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/update-activity/${activityId}`, activityData);
  }

  // Delete an activity
  deleteActivity(activityId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/delete-activity/${activityId}`);
  }

  getPurchaseLogs(): Observable<any> {
    return this.http.get(`${this.apiUrl}/purchase-logs`);
  }

  getFeedLogs(): Observable<any> {
    return this.http.get(`${this.apiUrl}/feed-logs`);
  }
}
