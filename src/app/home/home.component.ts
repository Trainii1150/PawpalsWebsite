import { Component, OnInit, AfterViewInit, HostListener  } from '@angular/core';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { Apollo } from 'apollo-angular';
import { CookieService } from 'ngx-cookie-service';
import { OwlOptions } from 'ngx-owl-carousel-o';
import gql from 'graphql-tag';
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

  showActivity = false;
  showInventory = false;
  showStore = false;
  genres = ['All', 'Foods', 'Decoration'];
  selectedGenre = 'All';
  petName: String | undefined = "David";
  foodStatus: Number | undefined ;
  happynessStatus: Number | undefined = 40;
  todayCodeTime: Number | undefined = 0;
  monthlyCodeTime: Number | undefined = 0;
  todayTimeCompare: Number | undefined = 0;
  monthlyTimeCompare: Number | undefined = 0;
  activityData: any[] = [];
  storeItems: any[] = [];
  userStorageItems: any[] = [];
  userCoins: Number | undefined = 0;
  timeByLanguage: any[] = [];

  items = [
    { name: 'Bread', description: 'Just ordinary bread.', image: '../assets/foods/07_bread_dish.png', genre: 'Foods', count: 10 },
    { name: 'Burger', description: 'Burger.', image: '../assets/foods/16_burger_dish.png', genre: 'Foods', count: 5 },
    { name: 'Burrito', description: 'Mexican time amigos.', image: '../assets/foods/18_burrito_dish.png', genre: 'Foods', count: 3 },
    { name: 'Above the Clouds', description: 'Background for your Extenios', image: '../assets/backgrounds/sofia-ritter-day-gif.gif', genre: 'Decoration', count: 1 }
  ];

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

  constructor(
    private authService: AuthService,
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
    this.getPetHungerLevel();
  }

  toggleActivity() {
    this.showActivity = !this.showActivity;
    this.showInventory = false;
    this.showStore = false;
  }

  toggleInventory() {
    this.showInventory = !this.showInventory;
    this.showActivity = false;
    this.showStore = false;
  }

  toggleStore() {
    this.showStore = !this.showStore;
    this.showInventory = false;
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
        }
      })
      .valueChanges
      .subscribe(
        (response: any) => {
          this.timeByLanguage = response.data.timeByLanguage;
          this.initializeChart();
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
    this.http.post('http://localhost:3000/api/buy-item', { uid, item_id: item.item_id })
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
getUserPet(): void {
  const uid = this.cookieService.get('uid');
  if (uid) {
    this.apollo.watchQuery({
      query: gql`
        query GetUserPet($uid: String!) {
          userPet(uid: $uid) {
            pet_id
            pet_name
            hunger_level
            last_fed
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
        const pet = response.data.userPet;
        this.petName = pet.pet_name;
        this.foodStatus = pet.hunger_level;
      },
      (error: any) => {
        console.error('Error getting user pet:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: `Failed to get user pet: ${error.message}`,
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
selectFoodItem(item: any) {
  const petId = 1; // ตัวอย่าง petId
  this.feedPet(petId, item.food_value, item.item_id);
}

feedPet(petId: number, foodValue: number, itemId: number): void {
  const uid = this.cookieService.get('uid');
  if (uid) {
    this.http.post('http://localhost:3000/api/feed-pet', { uid, petId, foodValue, itemId })
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

getPetHungerLevel(): void {
  const uid = this.cookieService.get('uid');
  if (uid) {
    this.apollo.watchQuery({
      query: gql`
        query GetUserPet($uid: String!) {
          userPet(uid: $uid) {
            hunger_level
          }
        }
      `,
      variables: {
        uid: uid
      }
    })
    .valueChanges
    .subscribe(
      (response: any) => {
        this.foodStatus = response.data.userPet.hunger_level;
      },
      (error: any) => {
        console.error('Error getting pet hunger level:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: `Failed to get pet hunger level: ${error.message}`,
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
randomizePet(): void {
  const uid = this.cookieService.get('uid');
  if (uid) {
    this.http.post('http://localhost:3000/api/randomize-pet', { uid })
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
    // ลบกราฟเดิมก่อนที่จะสร้างใหม่
    while (chartContainer.firstChild) {
      chartContainer.removeChild(chartContainer.firstChild);
    }
    
    const chart = new ApexCharts(chartContainer, this.getChartOptions());
    chart.render();
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

  selectGenre(genre: string) {
    this.selectedGenre = genre;
  }

  get filteredItems() {
    if (this.selectedGenre === 'All') {
      return this.items;
    }
    return this.items.filter(item => item.genre === this.selectedGenre);
  }

  selectItem(item: any) {
    console.log('Selected item:', item);
  }
}
