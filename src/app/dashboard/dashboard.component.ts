import { Component, OnInit } from '@angular/core';
import { AuthService } from '../service/auth.service';
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
  userPets: any[] = [];
  storageItems: any[] = [];
  selectedFile: File | null = null;
  imagePreviewUrl: string | ArrayBuffer | null = null;

  newUser: any = { username: '', email: '', role: '' };
  newItem: any = { item_name: '', description: '', item_type: '', path: '' };
  newPet: any = { petName: '', description: '', petType: '' , path: ''};
  newuserPet: any = {userpet_id: '',petName: '', petId: '', userId: '',path: ''}
  newStorageItem: any = { userId: '', itemId: '', quantity: 0 };

  selectedUser: any = null;
  selectedItem: any = null;
  selectedPet: any = null;
  selectedPetId: number = 0;
  selectedUserId: number = 0;
  selectedUserPet: any = null;
  selectedStorageItem: any = null;
  showForm: boolean = false;
  showCreateForm: boolean = false;


  constructor(private adminService: AdminService,  private authService: AuthService,private router: Router) {} // Inject Router

  ngOnInit() {
    this.fetchUsers();
  }

  navigateTo(section: string) {
    this.currentSection = section;
    switch (section) {
      case 'manage-users':
        this.fetchUsers();
        break;
      case 'manage-user-pets':
        this.fetchUserPets();
        this.fetchPets();
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
  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }


  // User Management Functions
  fetchUsers() {
    this.adminService.getAllUsers().subscribe(data => {
      this.users = data;
      this.showForm = false;
    });
  }

  /*createUser() {
    this.adminService.createUserPet(this.newUser.username, this.newUser.email, this.newUser.role).subscribe(() => {
      this.fetchUsers();
      this.newUser = { username: '', email: '', role: '' };
    });
  }*/

  updateUser() {
    this.adminService.updateUser(this.selectedUser.user_id, this.selectedUser.username, this.selectedUser.email, this.selectedUser.role, this.selectedUser.coins).subscribe(() => {
      this.fetchUsers();
      this.selectedUser = null;
       // Success alert
       Swal.fire({
        icon: 'success',
        title: 'User Updated',
        text: 'The user has been successfully updated.',
      });
    },
    (error) => {
      // Error alert
      console.log(error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to update the user. Please try again.',
      });
    });
  }

  deleteUser(userId: number) {
    this.adminService.deleteUser(userId).subscribe(() => {
      this.fetchUsers();
        // Success alert
        Swal.fire({
          icon: 'success',
          title: 'User Deleted',
          text: 'The user has been successfully deleted.',
        });
      },
      (error) => {
        // Error alert
        console.log(error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to delete the user. Please try again.',
        });
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

  // User Pet Management Functions
  fetchUserPets() {
    this.adminService.getAllUserPets().subscribe(data => {
      this.userPets = data;
    })
  }

  populateUserPetForm(userPet: any) {
    if(this.showForm) {
      this.showForm = false;
    } else {
      this.selectedUserPet = { ...userPet };
      this.imagePreviewUrl = userPet.path;
      this.showForm = true;
      this.showCreateForm = false;
      //this.fetchPets();
    }
  }
  showCreateUserPetForm() {
    if (this.showCreateForm) {
      // If the form is already open, close it
      this.showCreateForm = false;
    } else {
      // If the form is closed, reset and open it
      this.newuserPet = { user_pet_id: null, user_id: '', pet_id: '' ,path : ''};
      this.showCreateForm = true;
      this.showForm = false; // Ensure the update form is hidden
      //this.fetchPets();
    }
  }
  updateSelectedUser() {
    if (this.selectedUserId !== null) {
        this.selectedUser = this.users.find(user => user.user_id.toString() === this.selectedUserId.toString()) || null;
        if (this.selectedUser) {
            this.newuserPet.userId = this.selectedUser.user_id;
        }
    }
  }
  // Method to update the selected pet details when a pet is selected in the dropdown
  updateSelectedPet(selectedPetId : any) {
    if (this.selectedPetId !== null) {
         for (let pet of this.pets) {
          if (pet.pet_id.toString() === selectedPetId.toString()) {
              this.selectedPet = pet; // Set the selected pet
              break; // Exit the loop once the pet is found
          }
        }
        if (this.selectedPet) {
            this.newuserPet.petName = this.selectedPet.pet_name;
            this.newuserPet.petId = this.selectedPet.pet_id;
            this.newuserPet.path = this.selectedPet.path; // Store the selected pet's path
        }
    }
  }

  createUserPet() {
      this.adminService.createUserPet(this.newuserPet.userId, this.newuserPet.petId, this.newuserPet.petName, this.newuserPet.path).subscribe(()=>{
        this.newuserPet = {userpet_id: '',petName: '', petId: '', userId: '',path: ''};
        this.showCreateForm = false;
        this.fetchUserPets();
        this.fetchPets();
      })
  }

  // Method to update an existing user pet
  updateUserPet() {
      this.adminService.updateUserPet(
        this.selectedUserPet.user_pet_id,
        this.selectedUserPet.pet_id,
        this.selectedUserPet.pet_name,
        this.selectedUserPet.hunger_level
      ).subscribe(()=>{
        this.showForm = !this.showForm;
        this.fetchUserPets();
        this.fetchPets();
        this.selectedUserPet = null;
      })
  }

  // Delete a user pet
  deleteUserPet(userPetId: number,userId: any, petId: any) {
    this.adminService.deleteUserPet(userPetId, userId, petId).subscribe(() => {
      this.fetchUserPets();
    });
  }

  // Item Management Functions
  fetchItems() {
    this.adminService.getAllItems().subscribe(data => {
      this.imagePreviewUrl = null;
      this.items = data;
      this.showForm = false;
      this.showCreateForm = false;
    });
  }


  createItem() {
    if (!this.selectedFile) {
      Swal.fire({
        icon: 'warning',
        title: 'Please select an image',
        text: 'You need to upload an image before submitting!',
      });
      return; // หยุดการทำงานหากไม่มีไฟล์
    }
    const formData = new FormData();
    formData.append('itemname',this.newItem.item_name);
    formData.append('description',this.newItem.description);
    formData.append('itemtype',this.newItem.item_type);
    formData.append('itemImage', this.selectedFile!);
    this.adminService.createItem(formData).subscribe(() => {
        this.newItem = { item_name: '', description: '', item_type: '', path: '' };
        this.showCreateForm = false;
        this.imagePreviewUrl = null; // Reset preview
        this.fetchItems();
        Swal.fire({
          icon: 'success',
          title: 'Item Created',
          text: 'The Item has been successfully created.',
        });
        },
        (error) => {
          // Error alert
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Failed to create the item. Please try again.',
          });
    });
  }

  showCreateItemForm() {
    if (this.showCreateForm) {
      // If the form is already open, close it
      this.showCreateForm = false;
      this.imagePreviewUrl = null; // Reset preview
    } else {
      // If the form is closed, reset and open it
      this.newItem = { item_name: '', description: '', item_type: '', path: '' };
      this.imagePreviewUrl = null; // Reset preview
      this.showCreateForm = true;
      this.showForm = false; // Ensure the update form is hidden
    }
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
        // Success alert
        Swal.fire({
          icon: 'success',
          title: 'Item Updated',
          text: 'The item has been successfully updated.',
        });
      },
      (error) => {
        // Error alert
        console.log(error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to update the item. Please try again.',
        });
    })
  }

  deleteItem(itemId: number) {
    this.adminService.deleteItem(itemId).subscribe(() => {
      this.fetchItems();

       // Success alert
       Swal.fire({
        icon: 'success',
        title: 'Item Deleted',
        text: 'The item has been successfully deleted.',
      });
    },
    (error) => {
      // Error alert
      console.log(error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to delete the item. Please try again.',
      });
    });
  }

  populateItemForm(item: any) {
    if(this.showForm) {
      this.showForm = false;
    } else {
      this.selectedItem = { ...item };
      this.imagePreviewUrl = item.path;
      this.showForm = true;
      this.showCreateForm = false;
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
      this.showForm = false;
      this.showCreateForm = false;
    });
  }

  createPet() {
    if (!this.selectedFile) {
      Swal.fire({
        icon: 'warning',
        title: 'Please select an image',
        text: 'You need to upload an image before submitting!',
      });
      return; // หยุดการทำงานหากไม่มีไฟล์
    }
    const formData = new FormData();
    formData.append('petName', this.newPet.pet_name);
    formData.append('description', this.newPet.description);
    formData.append('petType', this.newPet.pet_type);
    formData.append('petImage', this.selectedFile!);
    console.log(formData);
    this.adminService.addPet(formData).subscribe(() => {
        this.newPet = { pet_name: '', description: '', pet_type: '', path: '' };
        this.showCreateForm = false;
        this.imagePreviewUrl = null; // Reset preview
        this.fetchPets();
          // Success alert
      Swal.fire({
        icon: 'success',
        title: 'Pet Created',
        text: 'The pet has been successfully created.',
      });
      },
      (error) => {
        // Error alert
        console.log(error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to create the pet. Please try again.',
        });
    });
  }

  showCreatePetForm() {
    if (this.showCreateForm) {
      // If the form is already open, close it
      this.showCreateForm = false;
      this.imagePreviewUrl = null; // Reset preview
    } else {
      // If the form is closed, reset and open it
      this.newPet = { pet_name: '', description: '', pet_type: '', path: '' };
      this.imagePreviewUrl = null; // Reset preview
      this.showCreateForm = true;
      this.showForm = false; // Ensure the update form is hidden
    }
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
       // Success alert
       Swal.fire({
        icon: 'success',
        title: 'Pet Updated',
        text: 'The pet has been successfully updated.',
      });
    },
    (error) => {
      // Error alert
      console.log(error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to update the pet. Please try again.',
      });
    });
  }

  deletePet(petId: number) {
    this.adminService.deletePet(petId).subscribe(() => {
      this.fetchPets();
      // Success alert
      Swal.fire({
        icon: 'success',
        title: 'Pet Deleted',
        text: 'The pet has been successfully deleted.',
      });
    },
    (error) => {
      // Error alert
      console.log(error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to delete the pet. Please try again.',
      });
    });
  }

  populatePetForm(pet: any) {
    if (this.showForm) {
      // If the same pet is clicked again, toggle the form
      this.showForm = !this.showForm;
      this.imagePreviewUrl = null; // Reset preview
    } else {
      // If a different pet is clicked, show the form and update the preview
      this.selectedPet = { ...pet };
      this.imagePreviewUrl = pet.path; // Set the image preview to the old image
      this.showForm = true;
      this.showCreateForm = false;
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
