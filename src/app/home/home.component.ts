import { Component, OnInit, AfterViewInit, HostListener } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { UserService } from '../services/user.service';
import { ChartService } from '../services/chart.service';
import { DataService } from '../services/data.service'; 
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { OwlOptions } from 'ngx-owl-carousel-o';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, AfterViewInit {
  petPath: string | undefined;
  showActivity = false;
  showInventory = false;
  showStore = false;
  showDecoration = false;
  genres = ['All', 'Foods', 'Decoration'];
  selectedGenre = 'All';
  petName: string | undefined = "David";
  foodStatus: number | undefined;
  happinessStatus: number | undefined = 40;
  exp: number | undefined;
  todayCodeTime: number | undefined = 0;
  monthlyCodeTime: number | undefined = 0;
  todayTimeCompare: number | undefined = 0;
  monthlyTimeCompare: number | undefined = 0;
  activityData: any[] = [];
  storeItems: any[] = [];
  userStorageItems: any[] = [];
  userCoins: number | undefined = 0;
  timeByLanguage: any[] = [];
  pets: any[] = [];
  backgrounds: any[] = [];
  selectedPet: any;
  selectedBackground: any;
  selectedMenu: string = 'pet';
  showInfoModal: boolean = false;
  progress: any;
  progress_item_path: string | undefined;

  customOptions: OwlOptions = {
    loop: true,
    mouseDrag: true,
    touchDrag: false,
    pullDrag: false,
    dots: false,
    navSpeed: 700,
    navText: ['', ''],
    responsive: {
      0: { items: 1 },
      400: { items: 2 },
      740: { items: 3 },
      940: { items: 4 }
    },
    nav: true
  };

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private router: Router,
    private chartService: ChartService,
    private dataService: DataService,
    private cookieService: CookieService,
  ) { }

  ngAfterViewInit(): void {
    this.chartService.initializeChart(this.timeByLanguage);
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any): void {
    this.chartService.initializeChart(this.timeByLanguage);
  }

  ngOnInit(): void {
    this.chartService.initializeChart(this.timeByLanguage);
    this.loadInitialData();
  }

  private loadInitialData(): void {
    const uid = this.cookieService.get('uid');

    this.dataService.getUserCoins(uid).subscribe((response: any) => {
      this.userCoins = response.data.userCoins.coins;
    });

    this.dataService.getUserPets(uid).subscribe((response: any) => {
      const pets = response.data.userPets;
      this.pets = pets;
      this.selectedPet = pets.length > 0 ? pets[0] : null;
      this.petName = pets.length > 0 ? pets[0].pet_name : 'No Pet';
      this.petPath = pets.length > 0 ? pets[0].path : '';
      this.foodStatus = pets.length > 0 ? pets[0].hunger_level : 0;
      this.exp = pets.length > 0 ? pets[0].exp : 0;
    });

    this.dataService.getStoreItems().subscribe((response: any) => {
      this.storeItems = response.data.storeItems;
    });

    this.dataService.getUserStorageItems(uid).subscribe((response: any) => {
      this.userStorageItems = response.data.userStorageItems;
    });

    this.dataService.getUserDecorationItems(uid).subscribe((response: any) => {
      const items = response.data.getUserDecorationItems;
      this.pets = items.pets;
      this.backgrounds = items.backgrounds;
    });

    this.dataService.getActivityData(uid).subscribe((response: any) => {
      this.activityData = response.data.activity;
    });
  }

  toggleActivity() {
    this.showActivity = !this.showActivity;
    this.showInventory = false;
    this.showStore = false;
    this.showDecoration = false;
  }

  toggleInventory() {
    this.showInventory = !this.showInventory;
    this.showActivity = false;
    this.showStore = false;
    this.showDecoration = false;
  }

  toggleStore() {
    this.showStore = !this.showStore;
    this.showInventory = false;
    this.showActivity = false;
    this.showDecoration = false;
  }

  toggleDecoration() {
    this.showDecoration = !this.showDecoration;
    this.showInventory = false;
    this.showStore = false;
    this.showActivity = false;
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  toggleInfoModal() {
    this.showInfoModal = !this.showInfoModal;
  }

  selectItem(item: any) {
    console.log('Selected item:', item);
  }

  selectFoodItem(item: any) {
    console.log('Selected food item:', item);
    // Implement feeding logic here
  }

  buyItem(item: any) {
    console.log('Buying item:', item);
    // Implement purchasing logic here
  }

  saveDecoration(): void {
    const uid = this.cookieService.get('uid');
    if (uid) {
      const decoration = {
        pet: this.selectedPet?.path,
        background: this.selectedBackground?.path,
      };
      this.userService.saveUserDecoration(uid, decoration).subscribe(
        (response: any) => {
          Swal.fire({
            icon: 'success',
            title: 'Success',
            text: 'Decoration saved successfully!',
          });
        },
        (error: any) => {
          console.error('Error saving decoration:', error);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: `Failed to save decoration: ${error.message}`,
          });
        }
      );
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'User ID not found in cookies',
      });
    }
  }

  randomizePet() {
    if (this.pets.length > 0) {
      const randomIndex = Math.floor(Math.random() * this.pets.length);
      this.selectedPet = this.pets[randomIndex];
      this.petName = this.selectedPet.pet_name;
      this.petPath = this.selectedPet.path;
      this.foodStatus = this.selectedPet.hunger_level;
      this.exp = this.selectedPet.exp;
    }
  }
}
