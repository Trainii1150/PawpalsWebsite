import { Component, OnInit } from '@angular/core';
import { AdminService } from '../service/admin.service'; // Import AdminService
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  currentSection: string | null = 'manage-users';
  users: any[] = [];
  items: any[] = [];
  pets: any[] = [];
  storageItems: any[] = [];

  newUser: any = { username: '', email: '', role: '' };
  newItem: any = { item_name: '', description: '', item_type: '' };
  newPet: any = { petName: '', description: '', petType: '' };
  newStorageItem: any = { userId: '', itemId: '', quantity: 0 };

  constructor(private adminService: AdminService, private router: Router) {} // Inject Router

  ngOnInit() {
    this.fetchUsers();
  }

  navigateTo(section: string) {
    this.currentSection = section;
    switch (section) {
      case 'manage-users':
        this.fetchUsers();
        break;
      case 'manage-items':
        this.fetchItems();
        break;
      case 'manage-pets':
        this.fetchPets();
        break;
      case 'manage-storage':
        this.fetchStorageItems();
        break;
      default:
        this.router.navigate(['/admin/dashboard']); // Ensure it stays in the dashboard
        break;
    }
  }

  // User Management Functions
  fetchUsers() {
    this.adminService.getAllUsers().subscribe(data => {
      this.users = data;
    });
  }

  createUser() {
    this.adminService.createUserPet(this.newUser.username, this.newUser.email, this.newUser.role).subscribe(() => {
      this.fetchUsers();
      this.newUser = { username: '', email: '', role: '' };
    });
  }

  updateUser(userId: number) {
    this.adminService.updateUser(userId, 'updateduser', 'updatedpassword', 'admin', 100).subscribe(() => {
      this.fetchUsers();
    });
  }

  deleteUser(userId: number) {
    this.adminService.deleteUser(userId).subscribe(() => {
      this.fetchUsers();
    });
  }

  // Item Management Functions
  fetchItems() {
    this.adminService.getAllItems().subscribe(data => {
      this.items = data;
    });
  }

  createItem() {
    this.adminService.createItem(this.newItem.item_name, this.newItem.description, this.newItem.item_type).subscribe(() => {
      this.fetchItems();
      this.newItem = { item_name: '', description: '', item_type: '' };
    });
  }

  updateItem(itemId: number) {
    this.adminService.updateItem(itemId, 'updateditem', 'updated description', 'type').subscribe(() => {
      this.fetchItems();
    });
  }

  deleteItem(itemId: number) {
    this.adminService.deleteItem(itemId).subscribe(() => {
      this.fetchItems();
    });
  }

  // Pet Management Functions
  fetchPets() {
    this.adminService.getAllPets().subscribe(data => {
      this.pets = data;
    });
  }

  createPet() {
    this.adminService.addPet(this.newPet.petName, this.newPet.description, this.newPet.petType).subscribe(() => {
      this.fetchPets();
      this.newPet = { petName: '', description: '', petType: '' };
    });
  }

  updatePet(petId: number) {
    this.adminService.updatePet(petId, 'updatedpet', 'updated description', 'type').subscribe(() => {
      this.fetchPets();
    });
  }

  deletePet(petId: number) {
    this.adminService.deletePet(petId).subscribe(() => {
      this.fetchPets();
    });
  }

  // Storage Item Management Functions
  fetchStorageItems() {
    this.adminService.getAllStorage().subscribe(data => {
      this.storageItems = data;
    });
  }

  addItemToStorage() {
    this.adminService.addItemToStorage(this.newStorageItem.userId, this.newStorageItem.itemId, this.newStorageItem.quantity).subscribe(() => {
      this.fetchStorageItems();
      this.newStorageItem = { userId: '', itemId: '', quantity: 0 };
    });
  }

  updateStorageItem(storageId: number, userId: number, itemId: number, quantity: number) {
    this.adminService.updateStorageItem(storageId, userId, itemId, quantity).subscribe(() => {
      this.fetchStorageItems();
    });
  }

  deleteStorageItem(storageId: number, userId: number, itemId: number) {
    this.adminService.deleteItemFromStorage(storageId, userId, itemId).subscribe(() => {
      this.fetchStorageItems();
    });
  }
}
