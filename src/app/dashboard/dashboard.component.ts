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

  selectedUser: any = null;
  selectedItem: any = null;
  selectedPet: any = null;
  selectedStorageItem: any = null;

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

  updateUser() {
    this.adminService.updateUser(this.selectedUser.user_id, this.selectedUser.username, this.selectedUser.email, this.selectedUser.role, 0).subscribe(() => {
      this.fetchUsers();
      this.selectedUser = null;
    });
  }

  deleteUser(userId: number) {
    this.adminService.deleteUser(userId).subscribe(() => {
      this.fetchUsers();
    });
  }

  populateUserForm(user: any) {
    this.selectedUser = { ...user };
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

  updateItem() {
    this.adminService.updateItem(this.selectedItem.item_id, this.selectedItem.item_name, this.selectedItem.description, this.selectedItem.item_type).subscribe(() => {
      this.fetchItems();
      this.selectedItem = null;
    });
  }

  deleteItem(itemId: number) {
    this.adminService.deleteItem(itemId).subscribe(() => {
      this.fetchItems();
    });
  }

  populateItemForm(item: any) {
    this.selectedItem = { ...item };
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

  updatePet() {
    this.adminService.updatePet(this.selectedPet.pet_id, this.selectedPet.pet_name, this.selectedPet.description, this.selectedPet.pet_type).subscribe(() => {
      this.fetchPets();
      this.selectedPet = null;
    });
  }

  deletePet(petId: number) {
    this.adminService.deletePet(petId).subscribe(() => {
      this.fetchPets();
    });
  }

  populatePetForm(pet: any) {
    this.selectedPet = { ...pet };
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

  updateStorageItem() {
    this.adminService.updateStorageItem(this.selectedStorageItem.storage_id, this.selectedStorageItem.user_id, this.selectedStorageItem.item_id, this.selectedStorageItem.quantity).subscribe(() => {
      this.fetchStorageItems();
      this.selectedStorageItem = null;
    });
  }

  deleteStorageItem(storageId: number, userId: number, itemId: number) {
    this.adminService.deleteItemFromStorage(storageId, userId, itemId).subscribe(() => {
      this.fetchStorageItems();
    });
  }

  populateStorageForm(storage: any) {
    this.selectedStorageItem = { ...storage };
  }
}
