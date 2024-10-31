import { Component, OnInit, AfterViewInit, HostListener } from '@angular/core';
import { AuthService } from '../service/auth.service';
import { UserService } from '../service/user.service';
import { Router } from '@angular/router';
import { Apollo, gql } from 'apollo-angular';
import { CookieService } from 'ngx-cookie-service';
import { Chart } from 'chart.js/auto';
import ApexCharts from 'apexcharts';
import Swal from 'sweetalert2';
import { v4 as uuidv4 } from 'uuid';
import moment from 'moment';
import { HttpClient } from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})

export class HomeComponent implements OnInit, AfterViewInit {
  pollIntervalId: any;
  selectedPetId: any;
  snInput: any;
  toggleInfoModal() {
    this.showInfoModal = !this.showInfoModal;
  }

  currentPetIndex = 0;
  totalPages: number | undefined;
  petPath: any;
  selectedLanguage: string = 'en';
  totalCoins: any;
  showActivity = false;
  showInventory = false;
  showStore = false;
  showDecoration = false;
  genres = ['All', 'Foods', 'Decoration'];
  selectedGenre = 'All';
  petName: String | undefined = 'David';
  foodStatus: number = 0; 
  happinessStatus: Number | undefined = 40;
  exp: Number | undefined;
  todayCodeTime: number = 0;
  monthlyCodeTime: number = 0;
  todayTimeCompare: number = 0;
  monthlyTimeCompare: number = 0;
  activityData: any[] = [];
  storeItems: any[] = [];
  userStorageItems: any[] = [];
  userCoins: number = 0;
  timeByLanguage: any[] = [];
  pets: any[] = [];
  backgrounds: any[] = [];
  selectedPet: any;
  selectedBackground: any;
  selectedMenu: string = 'pet';
  showInfoModal: boolean = false;
  currentPage = 1;
  rowsPerPage = 5;  // ค่าเริ่มต้น
  paginatedData: any[] = [];
  progress = [];
  progress_item_path: any;
  

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private router: Router,
    private apollo: Apollo,
    private cookieService: CookieService,
    private http: HttpClient,
    private translate: TranslateService
  ) {
    this.translate.addLangs(['en', 'th']);
    this.translate.setDefaultLang(this.selectedLanguage);
  }

  ngAfterViewInit(): void {
    this.initializeChart();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any): void {
    this.initializeChart();
  }

  ngOnInit(): void {
    this.displayTableData();
    this.initializeChart();
    this.getTime();
    this.getActivityData();
    this.getStoreItems();
    this.getUserCoins();
    this.getUserStorageItems();
    this.getTimeByLanguage();
    this.getUserDecorationItems();
    this.getUserPets();
    this.calculateTodayCompare();
    this.calculateMonthlyCompare();
    this.getUserSettings(); 
  }

  getActivityData(): void {
    const uid = this.cookieService.get('uid');
    if (uid) {
      this.apollo
        .watchQuery({
          query: gql`
            query GetActivity($uid: ID!) {
              activity(uid: $uid) {
                Languages
                wordcount
                coins
                time
                Timestamp
                project_name
                file_name
                code_references
                paste_count
              }
            }
          `,
          variables: { uid },
        })
        .valueChanges.subscribe(
          (response: any) => {
            this.activityData = response.data.activity.map((activity: any) => ({
              ...activity,
              Timestamp: this.cleanTimestamp(activity.Timestamp),
            }));
  
            this.displayRecentFiles();
          },
          (error: any) => {
          }
        );
    }
  }

  toggleActivity() {
    this.showActivity = !this.showActivity;
    this.showInventory = false;
    this.showStore = false;
    this.showDecoration = false;
    if (this.showActivity) {
      this.displayTableData(); // เรียกการแสดงข้อมูลทันทีเมื่อกดปุ่ม Activity
    }
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

  switchLanguage(language: string) {
    this.selectedLanguage = language;
    this.translate.use(language);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  displayTableData() {
    const startIndex = (this.currentPage - 1) * this.rowsPerPage;
    const endIndex = startIndex + this.rowsPerPage;
    this.paginatedData = this.activityData.slice(startIndex, endIndex);
    this.totalPages = Math.ceil(this.activityData.length / this.rowsPerPage); // คำนวณจำนวนหน้าทั้งหมด

  }

  scrollToPagination() {
    const paginationElement = document.getElementById('paginationSection');
    if (paginationElement) {
      paginationElement.scrollIntoView({ behavior: 'smooth' });
    }
  }
  // ฟังก์ชันสำหรับปุ่ม Next
  nextPage() {
    const maxPage = Math.ceil(this.activityData.length / this.rowsPerPage);
    if (this.currentPage < maxPage) {
      this.currentPage++;
      this.displayTableData();
      this.scrollToPagination();
    }
  }
  // ฟังก์ชันสำหรับปุ่ม Previous
  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.displayTableData();
      this.scrollToPagination();
    }
  }
  // ฟังก์ชันสำหรับอัพเดต Pagination
  updatePagination() {
    this.currentPage = 1; // รีเซ็ตไปที่หน้าที่ 1 เมื่อมีการเปลี่ยนจำนวนแถว
    this.displayTableData();
    this.scrollToPagination();
  }

  getTime(): void {
    const uid = this.cookieService.get('uid');
    if (uid) {
      this.apollo
        .watchQuery({
          query: gql`
            query GetActivity($uid: ID!) {
              activity(uid: $uid) {
                Languages
                wordcount
                coins
                time
                Timestamp
                project_name
                file_name
              }
            }
          `,
          variables: {
            uid: uid,
          },
        })
        .valueChanges.subscribe(
          (response: any) => {
            this.activityData = response.data.activity.map((activity: any) => {
              let timestamp = activity.Timestamp;

              if (typeof timestamp === 'string') {
                timestamp = parseInt(timestamp, 10);
              }

              if (timestamp < 10000000000) {
                timestamp *= 1000; // ถ้า timestamp เป็นหน่วยวินาที คูณด้วย 1000
              }

              const dateObj = moment(timestamp).toDate();

              return {
                ...activity,
                Timestamp: dateObj,
              };
            });

            this.activityData.forEach((activity: any) => {
            });
            this.calculateTodayCompare();
            this.calculateMonthlyCompare();
          },
          (error) => {
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
    }
  }

  calculateMonthlyCompare() {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const thisMonthTime = this.activityData
      .filter((activity) => {
        const activityDate = new Date(activity.Timestamp);
        return activityDate.getMonth() === currentMonth && activityDate.getFullYear() === currentYear;
      })
      .reduce((total, activity) => total + activity.time, 0);

    const lastMonthTime = this.activityData
      .filter((activity) => {
        const activityDate = new Date(activity.Timestamp);
        return activityDate.getMonth() === currentMonth - 1 && activityDate.getFullYear() === currentYear;
      })
      .reduce((total, activity) => total + activity.time, 0);

    console.log('This Month Time:', thisMonthTime);
    console.log('Last Month Time:', lastMonthTime);

    this.monthlyCodeTime = thisMonthTime; // เก็บเวลาเขียนโค้ดเดือนนี้

    const percentageChange = lastMonthTime
      ? ((thisMonthTime - lastMonthTime) / lastMonthTime) * 100
      : 0;

    this.monthlyTimeCompare = Number(percentageChange.toFixed(2));
  }

  calculateTodayCompare() {
    const todayTime = this.activityData
      .filter((activity) => this.isSameDay(activity.Timestamp, new Date()))
      .reduce((total, activity) => total + activity.time, 0);

    const yesterdayTime = this.activityData
      .filter((activity) => this.isSameDay(activity.Timestamp, new Date(Date.now() - 86400000)))
      .reduce((total, activity) => total + activity.time, 0);

    console.log('Today Time:', todayTime);
    console.log('Yesterday Time:', yesterdayTime);

    this.todayCodeTime = todayTime; // เก็บเวลาเขียนโค้ดวันนี้

    const percentageChange = yesterdayTime
      ? ((todayTime - yesterdayTime) / yesterdayTime) * 100
      : 0;

    this.todayTimeCompare = Number(percentageChange.toFixed(2));
    console.log('Today Time Compare:', this.todayTimeCompare);
  }

  isSameDay(timestamp: string | number, date: Date): boolean {
    const activityDate = new Date(timestamp);

    // ปรับวันที่ให้เป็นค่า UTC เพื่อหลีกเลี่ยงปัญหาเขตเวลา
    const utcActivityDate = new Date(
      activityDate.getUTCFullYear(),
      activityDate.getUTCMonth(),
      activityDate.getUTCDate()
    );

    const utcDate = new Date(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate()
    );

    return (
      utcActivityDate.getDate() === utcDate.getDate() &&
      utcActivityDate.getMonth() === utcDate.getMonth() &&
      utcActivityDate.getFullYear() === utcDate.getFullYear()
    );
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

  getTimeByLanguage(): void {
    const uid = this.cookieService.get('uid');
    if (uid) {
      this.apollo
        .watchQuery({
          query: gql`
            query GetTimeByLanguage($uid: String!) {
              timeByLanguage(uid: $uid) {
                language
                total_time
              }
            }
          `,
          variables: {
            uid: uid,
          },
          pollInterval: 300000, // ดึงข้อมูลทุกๆ 5 นาที (300,000 มิลลิวินาที)
        })
        .valueChanges.subscribe(
          (response: any) => {
            this.timeByLanguage = response.data.timeByLanguage;
            this.initializeChart(); // อัปเดตกราฟด้วยข้อมูลใหม่
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
        `,
      })
      .valueChanges.subscribe(
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
      this.apollo
        .watchQuery({
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
            uid: uid,
          },
        })
        .valueChanges.subscribe(
          (response: any) => {
            this.userStorageItems = response.data.userStorageItems;
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

  displayRecentFiles(): void {
    const recentFilesContainer = document.getElementById('recentFilesContainer');
    if (recentFilesContainer) {
      recentFilesContainer.innerHTML = this.activityData
        .slice(0, 3) // แสดงแค่ไฟล์ล่าสุด 3 ไฟล์
        .map(
          (file) => `
          <div class="flex justify-between">
            <span>${file.file_name}</span>
            <span>${moment(file.Timestamp).fromNow()}</span>
          </div>`
        )
        .join('');
    }
  }

  isFiniteValue(value: number | undefined): boolean {
    return typeof value === 'number' && isFinite(value);

  }

  formatTimestamp(timestamp: string | null | undefined): string {
    if (!timestamp) {
      return 'Invalid Date';
    }

    const date = new Date(timestamp);
    if (isNaN(date.getTime())) {
      return 'Invalid Date';
    }

    // รูปแบบใหม่: h:mm:ss a, MMMM Do YYYY
    const hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    const period = hours >= 12 ? 'PM' : 'AM';
    const day = String(date.getDate()).padStart(2, '0');
    const month = date.toLocaleString('default', { month: 'long' });
    const year = date.getFullYear();

    return `${hours % 12
      }:${minutes}:${seconds} ${period}, ${month} ${day} ${year}`;
  }

  buyItem(item: any): void {
    const uid = this.cookieService.get('uid');
    if (uid) {
      this.userService.buyItem(uid, item.item_id).subscribe(
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
      this.apollo
        .watchQuery({
          query: gql`
            query GetUserCoins($uid: String!) {
              userCoins(uid: $uid) {
                coins
              }
            }
          `,
          variables: {
            uid: uid,
          },
        })
        .valueChanges.subscribe(
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
      this.apollo
        .watchQuery({
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
          variables: { uid: uid },
          
          pollInterval: 3000000,
        })
        .valueChanges.subscribe(
          
          (response: any) => {
            this.pets = response.data.userPets;
            if (this.pets.length > 0) {
              this.getUserSettings();
              this.updateSelectedPet(this.pets[this.currentPetIndex].pet_id); // ใช้ฟังก์ชัน updateSelectedPet
              this.foodStatus = this.pets[this.currentPetIndex].hunger_level ?? 0;
            }
          },
          (error) => {
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

  getUserSettings(): void {
    const uid = this.cookieService.get('uid');
    if (uid) {
        this.apollo
            .watchQuery({
                query: gql`
                    query GetUserSettings($uid: ID!) {
                        getUserSettings(uid: $uid) {
                            selected_pet_id
                        }
                    }
                `,
                variables: { uid: uid },
            })
            .valueChanges.subscribe(
                (response: any) => {
                    const selectedPetId = response.data.getUserSettings.selected_pet_id;
                    if (selectedPetId && this.pets.length > 0) {
                        const petIndex = this.pets.findIndex((pet) => pet.pet_id === selectedPetId);
                        if (petIndex !== -1) {
                            this.currentPetIndex = petIndex;
                            this.selectedPetId = selectedPetId;
                            this.updateSelectedPet(this.selectedPetId); // อัปเดต UI
                            this.foodStatus = this.pets[this.currentPetIndex].hunger_level || 0;
                        }
                    }
                },
                (error) => {
                    console.error('Error getting user settings:', error);
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: `Failed to get user settings: ${error.message}`,
                    });
                }
            );
    } else {
        console.error('Token not found in cookies');
    }
}
  
  getUserPetExp(): void {
    const uid = this.cookieService.get('uid');
    if (uid) {
      this.apollo
        .watchQuery({
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
        .valueChanges.subscribe(
          (response: any) => {
            this.exp = response.data.userPetExp.exp;
          },
          (error) => {
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

  selectPet(petId: number): void {
    const uid = this.cookieService.get('uid');
    if (uid) {
        this.apollo.mutate({
            mutation: gql`
                mutation SetSelectedPet($uid: ID!, $pet_id: Int!) {
                    setSelectedPet(uid: $uid, pet_id: $pet_id) {
                        success
                    }
                }
            `,
            variables: { uid, pet_id: petId }
        }).subscribe(
            (response: any) => {
                if (response.data.setSelectedPet.success) {
                    Swal.fire('Success', 'Pet selected successfully!', 'success');
                    const petIndex = this.pets.findIndex(pet => pet.pet_id === petId);
                    if (petIndex !== -1) {
                        this.currentPetIndex = petIndex;
                        this.selectedPetId = petId;
                        this.updateSelectedPet(this.selectedPetId);
                        this.foodStatus = this.pets[this.currentPetIndex].hunger_level || 0;
                    }
                } else {
                    Swal.fire('Error', 'Failed to select pet', 'error');
                }
            },
            (error) => {
                Swal.fire('Error', 'Failed to select pet', 'error');
                console.error('Error selecting pet:', error);
            }
        );
    }
}

  updateHungerLevel(): void {
    const uid = this.cookieService.get('uid');
    if (uid && this.selectedPetId) {
      this.apollo
        .watchQuery({
          query: gql`
            query GetSelectedPetHunger($uid: String!, $pet_id: Int!) {
              userPets(uid: $uid) {
                pet_id
                hunger_level
              }
            }
          `,
          variables: { uid: uid, pet_id: this.selectedPetId },
          fetchPolicy: 'network-only' // ดึงข้อมูลใหม่ทุกครั้งที่เรียก
        })
        .valueChanges.subscribe(
          (response: any) => {
            const selectedPet = response.data.userPets.find((pet: any) => pet.pet_id === this.selectedPetId);
            if (selectedPet) {
              this.foodStatus = selectedPet.hunger_level;
            }
          },
          (error) => {
            console.error('Error getting selected pet hunger level:', error);
          }
        );
    }
  }
  
  prevPet() {
  if (this.pets.length > 0) {
    this.currentPetIndex = (this.currentPetIndex - 1 + this.pets.length) % this.pets.length;
    this.selectPet(this.pets[this.currentPetIndex].pet_id);
  }
}

  nextPet() {
  if (this.pets.length > 0) {
    this.currentPetIndex = (this.currentPetIndex + 1) % this.pets.length;
    this.selectPet(this.pets[this.currentPetIndex].pet_id);
  }
}

  updateSelectedPet(petId: number): void {
    const selectedPet = this.pets.find(pet => pet.pet_id === petId);
    if (selectedPet) {
      this.petName = selectedPet.pet_name;
      this.petPath = selectedPet.path;
    } else {
      console.warn(`Pet with id ${petId} not found`);
    }
  }

 selectFoodItem(item: any) {
    // ใช้ selectedPetId ที่ตั้งค่าไว้ในระบบแทนการใช้ petId เป็นตัวอย่าง
    this.feedPet(item.food_value, item.item_id);
}

feedPet(foodValue: number, itemId: number): void {
  const uid = this.cookieService.get('uid');
  if (uid) {
      const selectedPet = this.pets.find(pet => pet.pet_id === this.selectedPetId);
      if (!selectedPet) {
          Swal.fire({
              icon: 'warning',
              title: 'Warning',
              text: 'Selected pet not found.',
          });
          return;
      }

      this.userService.feedPet(uid, this.selectedPetId, foodValue, itemId).subscribe(
          (response: any) => {
              Swal.fire({
                  icon: 'success',
                  title: 'Success',
                  text: 'Pet fed successfully!',
              });

              // หักลบค่า hunger level ทันทีหลังการให้อาหาร
              this.foodStatus = Math.max(0, this.foodStatus + foodValue);

              // คัดลอก selectedPet และอัปเดต hunger_level
              const updatedPet = { ...selectedPet, hunger_level: this.foodStatus };
              
              // อัปเดตใน this.pets โดยการแทนที่ selectedPet ด้วย updatedPet
              this.pets = this.pets.map(pet => 
                  pet.pet_id === this.selectedPetId ? updatedPet : pet
              );

              this.getUserStorageItems(); // ดึงข้อมูลไอเทมใน storage ใหม่
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


generateReport(): void {
  const uid = this.cookieService.get('uid');
  this.apollo
    .watchQuery({
      query: gql`
        query CodingActivity($uid: ID!) {
          activity(uid: $uid) {
            Languages
            wordcount
            coins
            time
            Timestamp
            project_name
            file_name
            code_references
            paste_count
          }
        }
      `,
      variables: { uid: uid },
    })
    .valueChanges.subscribe((response: any) => {
      const activityData = response.data.activity;

      // กรองข้อมูลที่ไม่มีค่า time หรือ Timestamp ที่ถูกต้องออก
      const validActivityData = activityData.filter((activity: any) => {
        const isValid =
          typeof activity.time === 'number' &&
          !isNaN(activity.time) &&
          activity.Timestamp &&
          typeof activity.paste_count === 'number' &&
          !isNaN(activity.paste_count);
        if (!isValid) {
          console.warn(`Invalid or missing fields for file: ${activity.file_name}`);
        }
        return isValid;
      });

      const aggregatedProjectsByName = validActivityData.reduce((acc: any, project: any) => {
        const existingProject = acc.find((p: any) => p.project_name === project.project_name);
        if (existingProject) {
          const existingFile = existingProject.files.find((f: any) => f.file_name === project.file_name);
          if (existingFile) {
            existingFile.time += project.time || 0;
            existingFile.wordcount += project.wordcount || 0;
            existingFile.coins += project.coins || 0;
            existingFile.code_references = existingFile.code_references || [];
            if (project.code_references) {
              existingFile.code_references.push(project.code_references);
            }
            existingFile.paste_count += project.paste_count || 0;
          } else {
            existingProject.files.push({ ...project });
          }
        } else {
          acc.push({
            project_name: project.project_name,
            files: [{ ...project }],
          });
        }
        return acc;
      }, []);

      Swal.fire({
        title: 'Create Report',
        html: `
          <label for="name" class="label">Name</label>
          <input id="name" class="input input-bordered w-full max-w-xs swal2-input" placeholder="Your Name">
          <div style="text-align: left; margin-top: 20px;">
            <label class="label"><span class="label-text">Select project:</span></label><br>
            ${aggregatedProjectsByName.map(
              (project: { project_name: any }, index: number) => `
              <label class="label cursor-pointer">
                <span class="label-text">${project.project_name}</span>
                <input type="radio" name="project" id="project${index}" value="${index}" class="radio radio-primary" ${index === 0 ? 'checked' : ''}>
              </label>`
            ).join('')}
          </div>
          <div id="fileSelectionContainer" style="text-align: left; margin-top: 20px;"></div>
          <div style="text-align: left; margin-top: 20px;">
            <label class="label"><span class="label-text">Select details:</span></label><br>
            <label class="label cursor-pointer"><span class="label-text">Total Time</span>
              <input type="checkbox" id="totalTime" value="totalTime" class="checkbox checkbox-primary" checked>
            </label>
            <label class="label cursor-pointer"><span class="label-text">Word Count</span>
              <input type="checkbox" id="wordCount" value="wordCount" class="checkbox checkbox-primary" checked>
            </label>
            <label class="label cursor-pointer"><span class="label-text">Coins Earned</span>
              <input type="checkbox" id="coinsEarned" value="coinsEarned" class="checkbox checkbox-primary" checked>
            </label>
            <label class="label cursor-pointer"><span class="label-text">Timestamp</span>
              <input type="checkbox" id="timestampChecked" value="timestampChecked" class="checkbox checkbox-primary" checked>
            </label>
            <label class="label cursor-pointer"><span class="label-text">Code References</span>
              <input type="checkbox" id="codeReferences" value="codeReferences" class="checkbox checkbox-primary" checked>
            </label>
            <label class="label cursor-pointer"><span class="label-text">Paste Count</span>
              <input type="checkbox" id="pasteCount" value="pasteCount" class="checkbox checkbox-primary" checked>
            </label>
          </div>
        `,
        showCancelButton: true,
        confirmButtonText: 'Create Report',
        didOpen: () => {
          const projectRadios = document.querySelectorAll('input[name="project"]');
          projectRadios.forEach((radio: any) => {
            radio.addEventListener('change', () => {
              const selectedProjectIndex = parseInt(radio.value, 10);
              if (aggregatedProjectsByName[selectedProjectIndex]?.files) {
                this.populateFileSelection(aggregatedProjectsByName[selectedProjectIndex].files);
              } else {
                console.error('Files not found for the selected project');
              }
            });
          });

          this.populateFileSelection(aggregatedProjectsByName[0]?.files || []);
        },
        preConfirm: () => {
          // รับค่าจาก input ของชื่อผู้ใช้
          const name = (document.getElementById('name') as HTMLInputElement).value;
        
          // รับค่าจาก radio ที่เลือกโปรเจค
          const selectedProjectElement = document.querySelector(
            'input[name="project"]:checked'
          ) as HTMLInputElement;
          const selectedProjectIndex = selectedProjectElement
            ? selectedProjectElement.value
            : undefined;
        
          // รับค่าจาก checkbox ต่างๆ
          const totalTimeChecked = (
            document.getElementById('totalTime') as HTMLInputElement
          ).checked;
          const wordCountChecked = (
            document.getElementById('wordCount') as HTMLInputElement
          ).checked;
          const coinsEarnedChecked = (
            document.getElementById('coinsEarned') as HTMLInputElement
          ).checked;
          const timestampChecked = (
            document.getElementById('timestampChecked') as HTMLInputElement
          ).checked;
          const pasteCountChecked = (
            document.getElementById('pasteCount') as HTMLInputElement
          ).checked;
          const codeReferencesChecked = (
            document.getElementById('codeReferences') as HTMLInputElement
          ).checked;
        
          // ดึงค่าจาก checkbox ของไฟล์ที่เลือก
          const selectedFiles = Array.from(
            document.querySelectorAll('input[name="file"]:checked')
          ).map((checkbox: any) => checkbox.value);
        
          // ตรวจสอบการป้อนชื่อ
          if (!name) {
            Swal.showValidationMessage('Please enter your name');
            return;
          }
        
          // ตรวจสอบการเลือกโปรเจค
          if (selectedProjectIndex === undefined) {
            Swal.showValidationMessage('Please select a project');
            return;
          }
        
          // ตรวจสอบว่ามีการเลือกไฟล์อย่างน้อยหนึ่งไฟล์
          if (selectedFiles.length === 0) {
            Swal.showValidationMessage('Please select at least one file');
            return;
          }
        
          // คืนค่าข้อมูลทั้งหมดที่ต้องการกลับไป
          return {
            name,
            selectedProjectIndex,
            selectedFiles,
            totalTimeChecked,
            wordCountChecked,
            coinsEarnedChecked,
            timestampChecked,
            pasteCountChecked,
            codeReferencesChecked,
          };
        },
        
        
        
      }).then((result: any) => {
        if (result.isConfirmed) {
          const formData = result.value;
          const selectedProject =
            aggregatedProjectsByName[formData.selectedProjectIndex];

          const selectedFilesData = selectedProject.files.filter(
            (file: any) => formData.selectedFiles.includes(file.file_name)
          );

          this.createReportForProjectGroup(
            formData.name,
            selectedFilesData,
            formData
          );
        }
        
      }).then((result: any) => {
        if (result.isConfirmed) {
          const { name, selectedFiles, totalTime, wordCount, coinsEarned, timestamp, codeReferences, pasteCount } =
            result.value;

          // เรียกใช้ฟังก์ชัน createReportForProjectGroup พร้อมส่งข้อมูล
          this.createReportForProjectGroup(name, selectedFiles, {
            totalTimeChecked: !!(document.getElementById('totalTime') as HTMLInputElement).checked,
            wordCountChecked: !!(document.getElementById('wordCount') as HTMLInputElement).checked,
            coinsEarnedChecked: !!(document.getElementById('coinsEarned') as HTMLInputElement).checked,
            timestampChecked: !!(document.getElementById('timestampChecked') as HTMLInputElement).checked,
            codeReferencesChecked: !!(document.getElementById('codeReferences') as HTMLInputElement).checked,
            pasteCountChecked: !!(document.getElementById('pasteCount') as HTMLInputElement).checked,
          });
        }
      });
    });
}


populateFileSelection(files: any[]): void {
  const uniqueFiles = files.map((file: any) => ({
    file_name: file.file_name,
    time: file.time,
    wordcount: file.wordcount,
    coins: file.coins,
    Timestamp: file.Timestamp,
    code_references: file.code_references,
    paste_count: file.paste_count,
  }));

  const fileSelectionContainer = document.getElementById('fileSelectionContainer');
  if (fileSelectionContainer) {
    fileSelectionContainer.innerHTML = `
      <label class="label"><span class="label-text">Select files:</span></label><br>
      ${uniqueFiles.map((file: any, index: number) =>
        `<label class="label cursor-pointer">
          <span class="label-text">${file.file_name}</span>
          <input type="checkbox" name="file" value="${file.file_name}" class="checkbox checkbox-primary" ${index === 0 ? 'checked' : ''}>
        </label>`
      ).join('')}
    `;

    uniqueFiles.forEach((file: any, index: number) => {
      const button = document.getElementById(`detailsBtn${index}`);
      if (button) {
        button.addEventListener('click', () => {
          this.showDetails(file.file_name); // เปลี่ยนเป็นเพียงชื่อไฟล์
        });
      }
    });
    
  }
}


createReportForProjectGroup(
  name: string,
  projectFiles: any[],
  selectedDetails: any = {
    totalTimeChecked: false,
    wordCountChecked: false,
    coinsEarnedChecked: false,
    timestampChecked: false,
    codeReferencesChecked: false,
    pasteCountChecked: false,
  }
): void {
  const uid = this.cookieService.get('uid');
  const reportId = uuidv4(); // สร้าง UUID สำหรับ report_id

  // คำนวณข้อมูลสำหรับรายงาน
  const totalTime = projectFiles.reduce((acc: number, file: any) => acc + file.time, 0);
  const wordCount = projectFiles.reduce((acc: number, file: any) => acc + file.wordcount, 0);
  const coinsEarned = projectFiles.reduce((acc: number, file: any) => acc + file.coins, 0);
  const timestamp = new Date().toISOString();
  const codeReferences = projectFiles.flatMap((file: any) => file.code_references);
  const pasteCount = projectFiles.reduce((acc: number, file: any) => acc + file.paste_count, 0);

  // กำหนด startDate และ endDate จาก projectFiles
  const fileTimestamps = projectFiles.map((file) => parseInt(file.Timestamp, 10));
  const startDate = new Date(Math.min(...fileTimestamps)).toISOString(); // เริ่มจากเวลาต่ำสุด
  const endDate = new Date(Math.max(...fileTimestamps)).toISOString();   // สิ้นสุดที่เวลาสูงสุด

  // ข้อมูลสำหรับส่งไปยัง mutation
  const reportData = {
    reportId,  // เพิ่ม reportId ที่สร้าง
    name,
    selectedFiles: projectFiles.map((file: any) => file.file_name),
    totalTime: selectedDetails.totalTimeChecked ? totalTime : null,
    wordCount: selectedDetails.wordCountChecked ? wordCount : null,
    coinsEarned: selectedDetails.coinsEarnedChecked ? coinsEarned : null,
    timestamp: selectedDetails.timestampChecked ? timestamp : null,
    codeReferences: selectedDetails.codeReferencesChecked ? codeReferences : null,
    pasteCount: selectedDetails.pasteCountChecked ? pasteCount : null,
    startDate,
    endDate
  };

  console.log('Preparing to create report with calculated data:', reportData);

  // เรียก mutation เพื่อบันทึกข้อมูล
  this.apollo.mutate({
    mutation: gql`
      mutation SaveActivityReport($uid: ID!, $reportData: ReportInput!) {
        saveActivityReport(uid: $uid, reportData: $reportData) {
          success
          message
          reportId
        }
      }
    `,
    variables: {
      uid: uid,
      reportData: reportData
    }
  }).subscribe({
    next: (response) => {
      const data = response.data as { saveActivityReport: { success: boolean; message: string; reportId: string } };

      if (data.saveActivityReport.success) {
        console.log(`Report created successfully! Report ID: ${data.saveActivityReport.reportId}`);
      } else {
        console.warn(`Report creation failed with message: ${data.saveActivityReport.message}`);
      }
    },
    error: (error) => {
      console.error('Error creating report:', error);
    }
  });

  // แสดงรายงานพร้อม `report_id`
  const newWindow = window.open('', '_blank');
  if (newWindow) {
    let reportHtml = `
      <div style="padding: 20px; font-family: Arial, sans-serif; border: 1px solid #ccc; border-radius: 10px; max-width: 800px; margin: 20px auto;">
        <h1 style="color: #FF6B6B; text-align: center;">PawsPal</h1>
        <h2 style="text-align: center; color: #333;">Activity Report</h2>
        <h3 style="text-align: center; color: #555;">${name}</h3>
        <p style="text-align: center; color: #777;">Report ID: ${reportId}</p>
        <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
          <thead>
            <tr style="background-color: #f8f8f8;">
              <th style="padding: 10px; text-align: left;">File Name</th>
              ${selectedDetails.timestampChecked ? `<th style="padding: 10px; text-align: left;">Start Date</th><th style="padding: 10px; text-align: left;">End Date</th>` : ''}
              ${selectedDetails.totalTimeChecked ? `<th style="padding: 10px; text-align: left;">Total Time</th>` : ''}
              ${selectedDetails.wordCountChecked ? `<th style="padding: 10px; text-align: left;">Word Count</th>` : ''}
              ${selectedDetails.coinsEarnedChecked ? `<th style="padding: 10px; text-align: left;">Coins Earned</th>` : ''}
              ${selectedDetails.codeReferencesChecked ? `<th style="padding: 10px; text-align: left;">Code References</th>` : ''}
              ${selectedDetails.pasteCountChecked ? `<th style="padding: 10px; text-align: left;">Paste Count</th>` : ''}
            </tr>
          </thead>
          <tbody>
    `;

    projectFiles.forEach((file) => {
      const fileTimestamp = parseInt(file.Timestamp, 10);
      
      if (!isNaN(fileTimestamp) && file.time !== undefined) {
        const startDate = new Date(fileTimestamp);
        const endDate = new Date(fileTimestamp + file.time * 60 * 1000);

        reportHtml += `
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #ddd;">${file.file_name}</td>
            ${selectedDetails.timestampChecked ? `<td style="padding: 10px; border-bottom: 1px solid #ddd;">${startDate.toISOString().slice(0, 19).replace('T', ' ')}</td><td style="padding: 10px; border-bottom: 1px solid #ddd;">${endDate.toISOString().slice(0, 19).replace('T', ' ')}</td>` : ''}
            ${selectedDetails.totalTimeChecked ? `<td style="padding: 10px; border-bottom: 1px solid #ddd;">${(file.time / 60).toFixed(2)} hours</td>` : ''}
            ${selectedDetails.wordCountChecked ? `<td style="padding: 10px; border-bottom: 1px solid #ddd;">${file.wordcount}</td>` : ''}
            ${selectedDetails.coinsEarnedChecked ? `<td style="padding: 10px; border-bottom: 1px solid #ddd;">${file.coins.toFixed(2)}</td>` : ''}
            ${selectedDetails.codeReferencesChecked ? `<td style="padding: 10px; border-bottom: 1px solid #ddd;">${file.code_references}</td>` : ''}
            ${selectedDetails.pasteCountChecked ? `<td style="padding: 10px; border-bottom: 1px solid #ddd;">${file.paste_count}</td>` : ''}
          </tr>
        `;
      } else {
        console.warn('Invalid Timestamp or time:', file);
      }
    });

    reportHtml += `
          </tbody>
        </table>
        <p style="text-align: right; margin-top: 20px;">Generated on: ${new Date().toLocaleString()}</p>
      </div>
    `;

    newWindow.document.write(reportHtml);
    newWindow.document.close();

    newWindow.onload = () => {
      newWindow.print();
      newWindow.onafterprint = () => newWindow.close();
    };
  } else {
    console.error('Failed to open new window');
  }
}


// ฟังก์ชันสำหรับแสดงหน้าต่างรายงานพร้อมพิมพ์
displayReportWindow(reportId: string, name: string, projectFiles: any[], selectedDetails: any): void {
  const newWindow = window.open('', '_blank');
  if (newWindow) {
    let reportHtml = `
      <div style="padding: 20px; font-family: Arial, sans-serif; border: 1px solid #ccc; border-radius: 10px; max-width: 800px; margin: 20px auto;">
        <h1 style="color: #FF6B6B; text-align: center;">PawsPal</h1>
        <h2 style="text-align: center; color: #333;">Activity Report</h2>
        <h3 style="text-align: center; color: #555;">${name}</h3>
        <p style="text-align: center; font-weight: bold; color: #888;">Report ID: ${reportId}</p>
        <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
          <thead>
            <tr style="background-color: #f8f8f8;">
              <th style="padding: 10px; text-align: left;">File Name</th>
              ${selectedDetails.timestampChecked ? `<th style="padding: 10px; text-align: left;">Start Date</th><th style="padding: 10px; text-align: left;">End Date</th>` : ''}
              ${selectedDetails.totalTimeChecked ? `<th style="padding: 10px; text-align: left;">Total Time</th>` : ''}
              ${selectedDetails.wordCountChecked ? `<th style="padding: 10px; text-align: left;">Word Count</th>` : ''}
              ${selectedDetails.coinsEarnedChecked ? `<th style="padding: 10px; text-align: left;">Coins Earned</th>` : ''}
              ${selectedDetails.codeReferencesChecked ? `<th style="padding: 10px; text-align: left;">Code References</th>` : ''}
              ${selectedDetails.pasteCountChecked ? `<th style="padding: 10px; text-align: left;">Paste Count</th>` : ''}
            </tr>
          </thead>
          <tbody>
    `;

    projectFiles.forEach((file) => {
      const fileTimestamp = parseInt(file.Timestamp, 10);

      if (!isNaN(fileTimestamp) && file.time !== undefined) {
        const startDate = new Date(fileTimestamp);
        const endDate = new Date(fileTimestamp + file.time * 60 * 1000);

        reportHtml += `
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #ddd;">${file.file_name}</td>
            ${selectedDetails.timestampChecked ? `<td style="padding: 10px; border-bottom: 1px solid #ddd;">${startDate.toISOString().slice(0, 19).replace('T', ' ')}</td><td style="padding: 10px; border-bottom: 1px solid #ddd;">${endDate.toISOString().slice(0, 19).replace('T', ' ')}</td>` : ''}
            ${selectedDetails.totalTimeChecked ? `<td style="padding: 10px; border-bottom: 1px solid #ddd;">${(file.time / 60).toFixed(2)} hours</td>` : ''}
            ${selectedDetails.wordCountChecked ? `<td style="padding: 10px; border-bottom: 1px solid #ddd;">${file.wordcount}</td>` : ''}
            ${selectedDetails.coinsEarnedChecked ? `<td style="padding: 10px; border-bottom: 1px solid #ddd;">${file.coins.toFixed(2)}</td>` : ''}
            ${selectedDetails.codeReferencesChecked ? `<td style="padding: 10px; border-bottom: 1px solid #ddd;">${file.code_references}</td>` : ''}
            ${selectedDetails.pasteCountChecked ? `<td style="padding: 10px; border-bottom: 1px solid #ddd;">${file.paste_count}</td>` : ''}
          </tr>
        `;
      } else {
        console.warn('Invalid Timestamp or time:', file);
      }
    });

    reportHtml += `
          </tbody>
        </table>
        <p style="text-align: right; margin-top: 20px;">Generated on: ${new Date().toLocaleString()}</p>
      </div>
    `;

    newWindow.document.write(reportHtml);
    newWindow.document.close();

    newWindow.onload = () => {
      newWindow.print();
      newWindow.onafterprint = () => newWindow.close();
    };
  } else {
    console.error('Failed to open new window');
  }
}

showDetails(fileName: string): void {
  // ดึงข้อมูลทั้งหมดที่ตรงกับชื่อไฟล์
  const filteredData = this.activityData.filter(file => file.file_name === fileName);

  let detailsHtml = `<h3>${fileName} Details</h3>`;
  detailsHtml += `
    <div class="overflow-x-auto p-8">
      <table class="min-w-full divide-y divide-gray-200 table-auto">
        <thead class="bg-gray-50">
          <tr class="bg-green-100">
            <th scope="col" class="px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">
              Date
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">
              Total Time (hours)
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">
              Word Count
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">
              Coins Earned
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">
              Code References
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">
              Paste Count
            </th>
          </tr>
        </thead>
        <tbody>
  `;

  filteredData.forEach(data => {
    const date = new Date(parseInt(data.Timestamp, 10));
    detailsHtml += `
      <tr>
        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
          ${date.toISOString().slice(0, 19).replace("T", " ")}
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
          ${(data.time / 60).toFixed(2)}
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
          ${data.wordcount}
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
          ${data.coins.toFixed(2)}
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
          ${data.code_references}
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
          ${data.paste_count}
        </td>
      </tr>
    `;
  });

  detailsHtml += `
        </tbody>
      </table>
    </div>
  `;

  // แสดงรายละเอียดใน modal หรือส่วนที่เหมาะสมในหน้า
  const detailsContainer = document.createElement("div");
  detailsContainer.innerHTML = detailsHtml;
  document.body.appendChild(detailsContainer); // แสดงรายละเอียด
}

loadWorkTimeChart(projectFiles: any[]): void {
  const canvas = document.getElementById('workTimeChart') as HTMLCanvasElement | null;
  const ctx = canvas ? canvas.getContext('2d') : null;

  if (ctx) {  // ตรวจสอบว่าค่า ctx ไม่เป็น null
    const dailyData = projectFiles.map((file) => ({
      x: new Date(parseInt(file.Timestamp)).toLocaleDateString(),
      y: file.time,
    }));

    new Chart(ctx, {
      type: 'line',
      data: {
        datasets: [{
          label: 'Work Time (minutes)',
          data: dailyData,
          fill: false,
          borderColor: 'rgb(75, 192, 192)',
          tension: 0.1
        }]
      },
      options: {
        scales: {
          x: {
            type: 'time',
            time: {
              unit: 'day'
            },
            title: {
              display: true,
              text: 'Date'
            }
          },
          y: {
            title: {
              display: true,
              text: 'Work Time (minutes)'
            }
          }
        }
      }
    });
  } else {
    console.error("Canvas element with id 'workTimeChart' not found.");
  }
}

formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${day}/${month}/${year}`;
}

updateProjectOrFileSelection(data: any[], label: string): void {
  const container = document.getElementById('projectOrFileSelection');
  if (container) {
    container.innerHTML = data
      .map(
        (item, index) => `
      <label class="label cursor-pointer">
        <span class="label-text">${item[label]}</span>
        <input type="radio" name="projectOrFile" id="${label}${index}" value="${index}" class="radio radio-primary" ${
          index === 0 ? 'checked' : ''
        }>
      </label>`
      )
      .join('');
  }
}


formatTimestampToActiveDays(timestamp: string | null | undefined): string {
    if (!timestamp) {
        // ถ้า timestamp เป็น null หรือ undefined ให้แสดงข้อความที่เหมาะสม
        return (
            'No start date available - ' + moment(new Date()).format('DD/MM/YYYY')
        );
    }

    const startDate = new Date(parseInt(timestamp));
    const endDate = new Date();

    if (isNaN(startDate.getTime())) {
        // ถ้าการแปลง timestamp ไม่ถูกต้อง ให้แสดงวันที่สิ้นสุดเพียงอย่างเดียว
        return (
            'No start date available - ' + moment(endDate).format('DD/MM/YYYY')
        );
    }

    const formattedStartDate = `${startDate.getDate()}/${startDate.getMonth() + 1}/${startDate.getFullYear()}`;
    const formattedEndDate = `${endDate.getDate()}/${endDate.getMonth() + 1}/${endDate.getFullYear()}`;
    return `${formattedStartDate} - ${formattedEndDate}`;
}

cleanTimestamp(timestamp: string | number | null | undefined): string {
  if (!timestamp) {
      console.log('Timestamp is null or undefined');
      return 'Invalid date';
  }
  // ตรวจสอบว่า timestamp เป็น string และเป็นตัวเลขหรือไม่
  if (typeof timestamp === 'string' && !/^\d+$/.test(timestamp)) {
      console.log('Timestamp is a string but not a valid number:', timestamp);
      return 'Invalid date';
  }
  // แปลงเป็นตัวเลขถ้าเป็น string
  const timestampNum = typeof timestamp === 'string' ? parseInt(timestamp, 10) : timestamp;

  if (isNaN(timestampNum)) {
      console.log('Invalid timestamp after parsing:', timestampNum);
      return 'Invalid date';
  }
  // แปลง Unix timestamp เป็น Date object
  const dateObj = new Date(timestampNum);
  if (isNaN(dateObj.getTime())) {
      console.log('Invalid Date object:', dateObj);
      return 'Invalid date';
  }

  // จัดรูปแบบวันที่
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0'); // เดือนเริ่มจาก 0
  const day = String(dateObj.getDate()).padStart(2, '0');
  const hours = String(dateObj.getHours()).padStart(2, '0');
  const minutes = String(dateObj.getMinutes()).padStart(2, '0');
  const seconds = String(dateObj.getSeconds()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

checkSN(): void {
  const uid = this.cookieService.get('uid');
  if (!uid) {
    Swal.fire('Error', 'User ID not found in cookies', 'error');
    return;
  }
  this.apollo
    .query({
      query: gql`
        query getReportById($reportId: ID!) {
          getReportById(reportId: $reportId) {
            report_id
            user_id
            report_name
            selected_files
            total_time
            word_count
            coins_earned
            created_at
            code_references
            paste_count
            timestamp
          }
        }
      `,
      variables: {
        reportId: this.snInput,
      },
    })
    .subscribe(
      (response: any) => {
        const reportData = response.data.getReportById;

        if (reportData) {
          const createdDate = new Date(parseInt(reportData.created_at, 10)).toLocaleString();
          
          const newWindow = window.open('', '_blank', 'width=800,height=600');
          if (newWindow) {
            let reportHtml = `
              <div style="padding: 20px; font-family: Arial, sans-serif; border: 1px solid #ccc; border-radius: 10px; max-width: 800px; margin: 20px auto;">
                <h1 style="color: #FF6B6B; text-align: center;">PawsPal</h1>
                <h2 style="text-align: center; color: #333;">Activity Report</h2>
                <h3 style="text-align: center; color: #555;">${reportData.report_name}</h3>
                <p style="text-align: center;">Report ID: ${reportData.report_id}</p>
                <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
                  <thead>
                    <tr style="background-color: #f8f8f8;">
                      <th style="padding: 10px; text-align: left;">File Name</th>
                      <th style="padding: 10px; text-align: left;">Start Date</th>
                      <th style="padding: 10px; text-align: left;">End Date</th>
                      <th style="padding: 10px; text-align: left;">Total Time</th>
                      <th style="padding: 10px; text-align: left;">Word Count</th>
                      <th style="padding: 10px; text-align: left;">Coins Earned</th>
                      <th style="padding: 10px; text-align: left;">Code References</th>
                      <th style="padding: 10px; text-align: left;">Paste Count</th>
                    </tr>
                  </thead>
                  <tbody>
            `;

            reportData.selected_files.forEach((file: string, index: number) => {
              const startDate = new Date(parseInt(reportData.timestamp, 10));
              const endDate = new Date(startDate.getTime() + reportData.total_time * 60 * 1000);

              reportHtml += `
                <tr>
                  <td style="padding: 10px; border-bottom: 1px solid #ddd;">${file}</td>
                  <td style="padding: 10px; border-bottom: 1px solid #ddd;">${startDate.toISOString().slice(0, 19).replace('T', ' ')}</td>
                  <td style="padding: 10px; border-bottom: 1px solid #ddd;">${endDate.toISOString().slice(0, 19).replace('T', ' ')}</td>
                  <td style="padding: 10px; border-bottom: 1px solid #ddd;">${(reportData.total_time / 60).toFixed(2)} hours</td>
                  <td style="padding: 10px; border-bottom: 1px solid #ddd;">${reportData.word_count || 'N/A'}</td>
                  <td style="padding: 10px; border-bottom: 1px solid #ddd;">${reportData.coins_earned || 'N/A'}</td>
                  <td style="padding: 10px; border-bottom: 1px solid #ddd;">${reportData.code_references[index] || 'N/A'}</td>
                  <td style="padding: 10px; border-bottom: 1px solid #ddd;">${reportData.paste_count || 'N/A'}</td>
                </tr>
              `;
            });

            reportHtml += `
                  </tbody>
                </table>
                <p style="text-align: right; margin-top: 20px;">Generated on: ${new Date().toLocaleString()}</p>
              </div>
            `;

            newWindow.document.write(reportHtml);
            newWindow.document.close();
          } else {
            console.error('Failed to open new window');
          }
        } else {
          Swal.fire('Error', 'Report not found', 'error');
        }
      },
      (error) => {
        console.error('Error checking report ID:', error);
        Swal.fire('Error', 'Failed to check SN.', 'error');
      }
    );
}


  initializeChart(): void {
    const chartContainer = document.getElementById('donut-chart');
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
      colors: ['#1C64F2', '#16BDCA', '#FDBA8C', '#E74694'],
      chart: {
        height: 320,
        width: '100%',
        type: 'donut',
      },
      stroke: {
        colors: ['transparent'],
        lineCap: '',
      },
      plotOptions: {
        pie: {
          donut: {
            labels: {
              show: true,
              name: {
                show: true,
                fontFamily: 'Inter, sans-serif',
                offsetY: 20,
              },
              total: {
                showAlways: true,
                show: true,
                label: 'Total hour',
                fontFamily: 'Inter, sans-serif',
                formatter: function (w: { globals: { seriesTotals: any[] } }) {
                  const sum = w.globals.seriesTotals.reduce(
                    (a: any, b: any) => a + b,
                    0
                  );
                  return sum;
                },
              },
              value: {
                show: true,
                fontFamily: 'Inter, sans-serif',
                offsetY: -20,
                formatter: function (value: string) {
                  return value + 'h';
                },
              },
            },
            size: '80%',
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
        position: 'bottom',
        fontFamily: 'Inter, sans-serif',
      },
      yaxis: {
        labels: {
          formatter: function (value: string) {
            return value + 'h';
          },
        },
      },
      xaxis: {
        labels: {
          formatter: function (value: string) {
            return value + 'h';
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
      this.apollo
        .watchQuery({
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
            uid: uid,
          },
        })
        .valueChanges.subscribe(
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
