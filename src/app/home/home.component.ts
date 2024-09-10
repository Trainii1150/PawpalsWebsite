import { Component, OnInit, AfterViewInit, HostListener } from '@angular/core';
import { AuthService } from '../service/auth.service';
import { UserService } from '../service/user.service';
import { Router } from '@angular/router';
import { Apollo, gql } from 'apollo-angular';
import { CookieService } from 'ngx-cookie-service';
import { OwlOptions } from 'ngx-owl-carousel-o';
import ApexCharts from 'apexcharts';
import Swal from 'sweetalert2';
import moment from 'moment';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit, AfterViewInit {
  petPath: any;
  toggleInfoModal() {
    this.showInfoModal = !this.showInfoModal;
  }

 showActivity = false;
  showInventory = false;
  showStore = false;
  showDecoration = false;
  genres = ['All', 'Foods', 'Decoration'];
  selectedGenre = 'All';
  petName: String | undefined = "David";
  foodStatus: Number | undefined;
  happinessStatus: Number | undefined = 40;
  exp: Number | undefined; 
  todayCodeTime: Number | undefined = 0;
  monthlyCodeTime: Number | undefined = 0;
  todayTimeCompare: Number | undefined = 0;
  monthlyTimeCompare: Number | undefined = 0;
  activityData: any[] = [];
  storeItems: any[] = [];
  userStorageItems: any[] = [];
  userCoins: Number | undefined = 0;
  timeByLanguage: any[] = [];
  pets: any[] = [];
  backgrounds: any[] = [];
  selectedPet: any;
  selectedBackground: any;
  selectedMenu: string = 'pet'; 
  showInfoModal: boolean = false; 

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
  }

  progress: any;
  progress_item_path: any;

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private router: Router,
    private apollo: Apollo,
    private cookieService: CookieService,
    private http: HttpClient 
  ) { }

  ngAfterViewInit(): void {
    this.initializeChart();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any): void {
    this.initializeChart();
  }

  ngOnInit(): void {
    this.initializeChart();
    this.getTime();
    this.getActivityData();
    this.getStoreItems();
    this.getUserCoins();
    this.getUserStorageItems();
    this.getTimeByLanguage(); 
    this.getUserDecorationItems();
    this.getUserPets();
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

  getTime(): void {
    const uid = this.cookieService.get('uid');
    if (uid !== null) {
      this.apollo.watchQuery({
        query: gql`
          query GetTime($uid: String!) {
            time(uid: $uid)
          }
        `,
        variables: {
          uid: uid,
        }
      })
        .valueChanges
        .subscribe(
          (response: any) => {
            const timeInUnits = response.data.time / 10000;
            this.todayCodeTime = parseFloat(timeInUnits.toFixed(2));
          },
          error => {
            console.error('Error getting today time:', error);
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: `Failed to get today time: ${error.message}`,
            });
          }
        );
    } else {
      console.error('Token not found in localStorage');
    }
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

  subscribeToTimeByLanguageUpdates(): void {
    this.apollo.subscribe({
      query: gql`
        subscription OnTimeByLanguageUpdated {
          timeByLanguageUpdated {
            language
            total_time
          }
        }
      `
    }).subscribe((result: any) => {
      this.timeByLanguage = result.data.timeByLanguageUpdated;
      this.initializeChart();  // Re-render chart with updated data
    });
  }

  getTimeByLanguage(): void {
    const uid = this.cookieService.get('uid');
    if (uid) {
      this.apollo.watchQuery({
        query: gql`
          query GetTimeByLanguage($uid: String!) {
            timeByLanguage(uid: $uid) {
              language
              total_time
            }
          }
        `,
        variables: {
          uid: uid
        },
        pollInterval: 3000000 // ดึงข้อมูลทุกๆ 5 นาที (300,000 มิลลิวินาที)
      })
      .valueChanges
      .subscribe(
        (response: any) => {
          this.timeByLanguage = response.data.timeByLanguage;
          this.initializeChart();  // อัปเดตกราฟด้วยข้อมูลใหม่
        },
        (error: any) => {
          console.error('Error getting time by language:', error);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: `Failed to get time by language: ${error.message}`,
          });
        }
      );
    } else {
      console.error('Token not found in cookies');
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'User ID token not found in cookies',
      });
    }
  }
  

  getStoreItems(): void {
    this.apollo
      .watchQuery({
        query: gql`
          {
            storeItems {
              store_item_id
              item_id
              item_name
              description
              path
              price
              food_value
              created_at
            }
          }
        `
      })
      .valueChanges
      .subscribe(
        (response: any) => {
          this.storeItems = response.data.storeItems;
        },
        (error: any) => {
          console.error('Error getting store items:', error);
          
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: `Failed to get store items: ${error.message}`,
          });
        }
      );
  }

  getUserStorageItems(): void {
    const uid = this.cookieService.get('uid');
    if (uid) {
      this.apollo.watchQuery({
        query: gql`
          query GetUserStorageItems($uid: ID!) {
            userStorageItems(uid: $uid) {
              storage_id
              item_name
              description
              path
              food_value
              created_at
              quantity 
            }
          }
        `,
        variables: {
          uid: uid
        },
      })
      .valueChanges
      .subscribe(
        (response: any) => {
          this.userStorageItems = response.data.userStorageItems;
          console.log(this.userStorageItems);
        },
        (error: any) => {
          console.error('Error getting user storage items:', error);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: `Failed to get user storage items: ${error.message}`,
          });
        }
      );
    } else {
      console.error('Token not found in cookies');
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'User ID token not found in cookies',
      });
    }
  }

  getActivityData(): void {
    const uid = this.cookieService.get('uid');
    if (uid) {
        this.apollo.watchQuery({
            query: gql`
                query GetActivity($uid: ID!) {
                    activity(uid: $uid) {
                        Languages
                        wordcount
                        coins
                        time
                        Timestamp
                    }
                }
            `,
            variables: {
                uid: uid
            },
        })
        .valueChanges
        .subscribe(
            (response: any) => {
                this.activityData = response.data.activity.map((activity: any) => {
                    return {
                        ...activity,
                        Timestamp: this.formatTimestamp(activity.Timestamp),
                    };
                });
            },
            (error: any) => {
                console.error('Error getting activity data:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: `Failed to get activity data: ${error.message}`,
                });
            }
        );
    } else {
        console.error('Token not found in cookies');
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'User ID token not found in cookies',
        });
    }
  }

  formatTimestamp(timestamp: string | null | undefined): string {
    if (!timestamp) {
      return 'Invalid Date';
    }

    const date = new Date(timestamp);
    if (isNaN(date.getTime())) {
      return 'Invalid Date';
    }

    return moment(date).format('h:mm:ss a, MMMM Do YYYY');
  }

  buyItem(item: any): void {
    const uid = this.cookieService.get('uid');
    if (uid) {
      this.userService.buyItem(uid, item.item_id)
        .subscribe(
          (response: any) => {
            Swal.fire({
              icon: 'success',
              title: 'Success',
              text: 'Item bought successfully!',
            });
            this.getUserStorageItems();
            const itemPrice = item.price;
            if (this.userCoins !== undefined && itemPrice !== undefined) {
              this.userCoins = (this.userCoins as number) - itemPrice;
            }
          },
          (error: any) => {
            console.error('Error buying item:', error);
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: `Failed to buy item: ${error.message}`,
            });
          }
        );
    } else {
      console.error('User ID not found in cookies');
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'User ID not found in cookies',
      });
    }
  }

  getUserCoins(): void {
    const uid = this.cookieService.get('uid');
    if (uid) {
      this.apollo.watchQuery({
        query: gql`
          query GetUserCoins($uid: String!) {
            userCoins(uid: $uid) {
              coins
            }
          }
        `,
        variables: {
          uid: uid
        },
      })
        .valueChanges
        .subscribe(
          (response: any) => {
            this.userCoins = response.data.userCoins.coins;
          },
          (error: any) => {
            console.error('Error getting user coins:', error);
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: `Failed to get user coins: ${error.message}`,
            });
          }
        );
    } else {
      console.error('Token not found in cookies');
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'User ID token not found in cookies',
      });
    }
  }

  getUserPets(): void {
    const uid = this.cookieService.get('uid');
    if (uid) {
      this.apollo.watchQuery({
        query: gql`
          query GetUserPets($uid: String!) {
            userPets(uid: $uid) {
              pet_id
              pet_name
              hunger_level
              last_fed
              path
              exp
            }
          }
        `,
        variables: {
          uid: uid
        },
        pollInterval: 3000000 // Polling ทุกๆ 5 นาที (300,000 มิลลิวินาที)
      })
      .valueChanges
      .subscribe(
        (response: any) => {
          const pet = response.data.userPets[0]; // สมมติว่าเราดึงสัตว์เลี้ยงตัวแรก
          this.petName = pet.pet_name;
          this.foodStatus = pet.hunger_level;  // อัปเดตค่า hunger_level
          this.happinessStatus = 40; // ค่า happiness ที่กำหนดเอง
          this.exp = pet.exp;
          this.petPath = pet.path;
        },
        error => {
          console.error('Error getting user pets:', error);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: `Failed to get user pets: ${error.message}`,
          });
        }
      );
    } else {
      console.error('Token not found in cookies');
    }
  }
  

  selectFoodItem(item: any) {
    const petId = 1; // ตัวอย่าง petId
    this.feedPet(petId, item.food_value, item.item_id);
  }

  getUserPetExp(): void {
    const uid = this.cookieService.get('uid');
    if (uid) {
      this.apollo.watchQuery({
        query: gql`
          query GetUserPetExp($uid: String!) {
            userPetExp(uid: $uid) {
              exp
            }
          }
        `,
        variables: {
          uid: uid,
        },
      })
        .valueChanges
        .subscribe(
          (response: any) => {
            this.exp = response.data.userPetExp.exp;
          },
          error => {
            console.error('Error getting pet experience:', error);
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: `Failed to get pet experience: ${error.message}`,
            });
          }
        );
    } else {
      console.error('Token not found in cookies');
    }
  }

  feedPet(petId: number, foodValue: number, itemId: number): void {
    const uid = this.cookieService.get('uid');
    if (uid) {
      this.userService.feedPet(uid, petId, foodValue, itemId)
        .subscribe(
          (response: any) => {
            Swal.fire({
              icon: 'success',
              title: 'Success',
              text: 'Pet fed successfully!',
            });
            this.getUserStorageItems();
          },
          (error: any) => {
            console.error('Error feeding pet:', error);
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: `Failed to feed pet: ${error.message}`,
            });
          }
        );
    } else {
      console.error('User ID not found in cookies');
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'User ID not found in cookies',
      });
    }
  }

  randomizePet(): void {
    const uid = this.cookieService.get('uid');
    if (uid) {
      this.userService.randomizePet(uid)
        .subscribe(
          (response: any) => {
            Swal.fire({
              icon: 'success',
              title: 'Success',
              text: 'Pet randomized successfully!',
            });
          },
          (error: any) => {
            console.error('Error randomizing pet:', error);
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: `Failed to randomize pet: ${error.message}`,
            });
          }
        );
    } else {
      console.error('User ID not found in cookies');
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'User ID not found in cookies',
      });
    }
  }

  

  initializeChart(): void {
    const chartContainer = document.getElementById("donut-chart");
    if (chartContainer && typeof ApexCharts !== 'undefined') {
      while (chartContainer.firstChild) {
        chartContainer.removeChild(chartContainer.firstChild);
      }

      if (this.timeByLanguage.length > 0) {
        const chart = new ApexCharts(chartContainer, this.getChartOptions());
        chart.render();
      } else {
        console.warn('No data available for chart');
      }
    }
  }

  getChartOptions() {
    return {
      series: this.timeByLanguage.map((data: any) => data.total_time),
      labels: this.timeByLanguage.map((data: any) => data.language),
      colors: ["#1C64F2", "#16BDCA", "#FDBA8C", "#E74694"],
      chart: {
        height: 320,
        width: "100%",
        type: "donut",
      },
      stroke: {
        colors: ["transparent"],
        lineCap: "",
      },
      plotOptions: {
        pie: {
          donut: {
            labels: {
              show: true,
              name: {
                show: true,
                fontFamily: "Inter, sans-serif",
                offsetY: 20,
              },
              total: {
                showAlways: true,
                show: true,
                label: "Total hour",
                fontFamily: "Inter, sans-serif",
                formatter: function (w: { globals: { seriesTotals: any[]; }; }) {
                  const sum = w.globals.seriesTotals.reduce((a: any, b: any) => a + b, 0);
                  return sum;
                },
              },
              value: {
                show: true,
                fontFamily: "Inter, sans-serif",
                offsetY: -20,
                formatter: function (value: string) {
                  return value + "h";
                },
              },
            },
            size: "80%",
          },
        },
      },
      grid: {
        padding: {
          top: -2,
        },
      },
      dataLabels: {
        enabled: false,
      },
      legend: {
        position: "bottom",
        fontFamily: "Inter, sans-serif",
      },
      yaxis: {
        labels: {
          formatter: function (value: string) {
            return value + "h";
          },
        },
      },
      xaxis: {
        labels: {
          formatter: function (value: string) {
            return value + "h";
          },
        },
        axisTicks: {
          show: false,
        },
        axisBorder: {
          show: false,
        },
      },
    };
  }

  selectItem(item: any) {
    console.log('Selected item:', item);
  }

  getUserDecorationItems(): void {
    const uid = this.cookieService.get('uid');
    if (uid) {
      this.apollo.watchQuery({
        query: gql`
          query GetUserDecorationItems($uid: ID!) {
            getUserDecorationItems(uid: $uid) {
              pets {
                pet_id
                pet_name
                path
              }
              backgrounds {
                item_id
                item_name
                path
              }
            }
          }
        `,
        variables: {
          uid: uid
        }
      }).valueChanges.subscribe(
        (response: any) => {
          this.pets = response.data.getUserDecorationItems.pets;
          this.backgrounds = response.data.getUserDecorationItems.backgrounds;
        },
        (error: any) => {
          console.error('Error getting decoration items:', error);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: `Failed to get decoration items: ${error.message}`,
          });
        }
      );
    } else {
      console.error('User ID not found in cookies');
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'User ID not found in cookies',
      });
    }
  }
}
