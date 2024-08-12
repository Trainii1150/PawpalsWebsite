import { Component, OnInit } from '@angular/core';
import { AdminService } from '../service/admin.service'; // Import AdminService
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

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
  selectedFile: File | null = null;
  imagePreviewUrl: string | ArrayBuffer | null = null;

  newUser: any = { username: '', email: '', role: '' };
  newItem: any = { item_name: '', description: '', item_type: '', path: '' };
  newPet: any = { petName: '', description: '', petType: '' , path: ''};
  newStorageItem: any = { userId: '', itemId: '', quantity: 0 };

  selectedUser: any = null;
  selectedItem: any = null;
  selectedPet: any = null;
  selectedStorageItem: any = null;
  showForm: boolean = false;

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
    console.log(this.showForm)
    if (this.selectedUser && this.selectedUser.user_id === user.user_id) {
      // If the same user is clicked again, toggle the form
      this.showForm = !this.showForm;
    } else {
      // If a different user is clicked, show the form
      this.selectedUser = { ...user };
      this.showForm = true;
    }
  }

  banUser(userId: number, shouldBan: boolean) {
    this.adminService.banUser(userId, shouldBan).subscribe(() => {
      this.fetchUsers(); // Refresh user list after banning/unbanning
      Swal.fire({
        icon: 'success',
        title: `User ${shouldBan ? 'Banned' : 'Unbanned'}`,
        text: `The user has been ${shouldBan ? 'banned' : 'unbanned'}.`,
      });
    }, error => {
      Swal.fire({
        icon: 'error',
        title: `Error`,
        text: `Failed to ${shouldBan ? 'ban' : 'unban'} the user.`,
      });
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

  updateItem() {
    const formData = new FormData();
    formData.append('itemid',this.selectedItem.item_id);
    formData.append('itemname',this.selectedItem.item_name);
    formData.append('description',this.selectedItem.description);
    formData.append('itemtype',this.selectedItem.item_type);
    formData.append('itemImage', this.selectedFile!);
    this.adminService.updateItem(formData).subscribe(()=>{
      this.showForm = !this.showForm;
      this.imagePreviewUrl = null; // Clear the image preview
      this.fetchItems();
      this.selectedPet = null;
    })
  }

  deleteItem(itemId: number) {
    this.adminService.deleteItem(itemId).subscribe(() => {
      this.fetchItems();
    });
  }

  populateItemForm(item: any) {
    if(this.selectedItem && this.selectedItem.id === item.id) {
      this.showForm = !this.showForm;
    } else {
      this.selectedItem = { ...item };
      this.imagePreviewUrl = item.path;
      this.showForm = true;
    }
  }

  onFileSelectedItemimg(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreviewUrl = reader.result; // Set the preview URL
      };
      reader.readAsDataURL(file);
    }
  }

  // Pet Management Functions
  fetchPets() {
    this.adminService.getAllPets().subscribe(data => {
      this.imagePreviewUrl = null;
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
    const formData = new FormData();
    formData.append('petId', this.selectedPet.pet_id);
    formData.append('petName', this.selectedPet.pet_name);
    formData.append('description', this.selectedPet.description);
    formData.append('petType', this.selectedPet.pet_type);
    formData.append('petImage', this.selectedFile!);
    this.adminService.updatePet(formData).subscribe(() => {
      this.showForm = !this.showForm;
      this.imagePreviewUrl = null; // Clear the image preview
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
    if (this.selectedPet && this.selectedPet.id === pet.id) {
      // If the same pet is clicked again, toggle the form
      this.showForm = !this.showForm;
    } else {
      // If a different pet is clicked, show the form and update the preview
      this.selectedPet = { ...pet };
      this.imagePreviewUrl = pet.path; // Set the image preview to the old image
      this.showForm = true;
    }
  }

  onFileSelectedPetimg(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreviewUrl = reader.result; // Set the preview URL
      };
      reader.readAsDataURL(file);
    }
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
