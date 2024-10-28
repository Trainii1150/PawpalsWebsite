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
import { TranslateService } from '@ngx-translate/core';

import html2pdf from 'html2pdf.js';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})

export class HomeComponent implements OnInit, AfterViewInit {
  pollIntervalId: any;
  selectedPetId: any;
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
              }
            }
          `,
          variables: {
            uid: uid,
          },
        })
        .valueChanges.subscribe(
          (response: any) => {
            // เพิ่มการเรียงลำดับตาม Timestamp ก่อนเก็บข้อมูล
            this.activityData = response.data.activity
              .map((activity: any) => ({
                ...activity,
                Timestamp: this.cleanTimestamp(activity.Timestamp),
              }))
              .sort((a: any, b: any) => new Date(b.Timestamp).getTime() - new Date(a.Timestamp).getTime()); // เรียงลำดับจากมากไปน้อย (ล่าสุดก่อน)

            // แสดงข้อมูลที่เรียงแล้วในส่วนของ Recent Files
            this.displayRecentFiles();
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
              console.log('Converted Date with moment:', dateObj);

              return {
                ...activity,
                Timestamp: dateObj,
              };
            });

            this.activityData.forEach((activity: any) => {
              console.log('Timestamp:', activity.Timestamp, 'Date Object:', new Date(activity.Timestamp));
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
          pollInterval: 3000000, // ดึงข้อมูลทุกๆ 5 นาที (300,000 มิลลิวินาที)
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
            console.log("Pets data fetched:", this.pets);
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




  randomizePet(): void {
    const uid = this.cookieService.get('uid');
    if (uid) {
      this.userService.randomizePet(uid).subscribe(
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

    const formattedStartDate = `${startDate.getDate()}/${startDate.getMonth() + 1
      }/${startDate.getFullYear()}`;
    const formattedEndDate = `${endDate.getDate()}/${endDate.getMonth() + 1
      }/${endDate.getFullYear()}`;
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
    const timestampNum =
      typeof timestamp === 'string' ? parseInt(timestamp, 10) : timestamp;

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

    const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    return formattedDate;
  }

  generateReport(): void {
    const element = document.getElementById('pdf-content');
    if (element) {
      const options = {
        margin: 1,
        filename: 'activity-report.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
      };
      html2pdf().from(element).set(options).save();
    }
  }
  
  createReportForProjectGroup(
    name: string,
    projectFiles: any[],
    selectedDetails: any = {
      totalTimeChecked: true,
      wordCountChecked: true,
      coinsEarnedChecked: true,
      codeReferencesChecked: true,
      pasteCountChecked: true,
      timestampChecked: true,
    }
  ): void {
    // Generate HTML for the report content
    const reportHtml = `
      <div id="pdf-content" style="padding: 20px; font-family: Arial, sans-serif;">
        <h1 style="text-align: center; color: #FF6B6B;">Activity Report</h1>
        <h2 style="text-align: center;">${name}</h2>
        <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
          <thead>
            <tr>
              <th>File Name</th>
              ${selectedDetails.timestampChecked ? `<th>Start Date</th><th>End Date</th>` : ''}
              ${selectedDetails.totalTimeChecked ? `<th>Total Time (hours)</th>` : ''}
              ${selectedDetails.wordCountChecked ? `<th>Word Count</th>` : ''}
              ${selectedDetails.coinsEarnedChecked ? `<th>Coins Earned</th>` : ''}
              ${selectedDetails.codeReferencesChecked ? `<th>Code References</th>` : ''}
              ${selectedDetails.pasteCountChecked ? `<th>Paste Count</th>` : ''}
            </tr>
          </thead>
          <tbody>
            ${projectFiles.map(file => `
              <tr>
                <td>${file.file_name}</td>
                ${selectedDetails.timestampChecked ? `<td>${this.formatDate(file.Timestamp)}</td><td>${this.formatDate(file.Timestamp + file.time * 60 * 1000)}</td>` : ''}
                ${selectedDetails.totalTimeChecked ? `<td>${(file.time / 60).toFixed(2)}</td>` : ''}
                ${selectedDetails.wordCountChecked ? `<td>${file.wordcount}</td>` : ''}
                ${selectedDetails.coinsEarnedChecked ? `<td>${file.coins.toFixed(2)}</td>` : ''}
                ${selectedDetails.codeReferencesChecked ? `<td>${file.code_references}</td>` : ''}
                ${selectedDetails.pasteCountChecked ? `<td>${file.paste_count}</td>` : ''}
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div style="margin-top: 20px;">
          <h3>Summary</h3>
          <p><strong>Total Time:</strong> ${projectFiles.reduce((sum, file) => sum + file.time, 0) / 60} hours</p>
          <p><strong>Total Word Count:</strong> ${projectFiles.reduce((sum, file) => sum + file.wordcount, 0)}</p>
          <p><strong>Total Coins Earned:</strong> ${projectFiles.reduce((sum, file) => sum + file.coins, 0).toFixed(2)}</p>
          <p><strong>Total Code References:</strong> ${projectFiles.reduce((sum, file) => sum + file.code_references, 0)}</p>
          <p><strong>Total Paste Count:</strong> ${projectFiles.reduce((sum, file) => sum + file.paste_count, 0)}</p>
        </div>
      </div>
    `;
  
    // Create a temporary element to contain the HTML content
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = reportHtml;
    document.body.appendChild(tempDiv);
  
    // Use html2pdf to generate and download the report
    const options = {
      margin: 1,
      filename: 'activity-report.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
    };
  
    html2pdf().from(tempDiv).set(options).save().then(() => {
      document.body.removeChild(tempDiv); // Remove the temporary element after saving
    });
  }
  
  formatDate(timestamp: number): string {
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  }

  populateFileSelection(files: any[]): void {
    // ไม่รวมไฟล์ชื่อเดียวกัน และไม่รวมข้อมูลที่ไม่จำเป็น
    const uniqueFiles = files.map((file: any) => ({
      file_name: file.file_name,
      time: file.time,
      wordcount: file.wordcount,
      coins: file.coins,
      Timestamp: file.Timestamp, // แยก Timestamp ของแต่ละไฟล์
    }));

    const fileSelectionContainer = document.getElementById(
      'fileSelectionContainer'
    );
    if (fileSelectionContainer) {
      fileSelectionContainer.innerHTML = `
        <label class="label"><span class="label-text">Select files:</span></label><br>
        ${uniqueFiles
          .map(
            (file: any, index: number) =>
              `<label class="label cursor-pointer">
              <span class="label-text">${file.file_name}</span>
              <input type="checkbox" name="file" value="${file.file_name
              }" class="checkbox checkbox-primary" ${index === 0 ? 'checked' : ''
              }>
            </label>`
          )
          .join('')}
      `;
    }
  }

  updateProjectOrFileSelection(data: any[], label: string): void {
    const container = document.getElementById('projectOrFileSelection');
    if (container) {
      container.innerHTML = data
        .map(
          (item, index) => `
        <label class="label cursor-pointer">
          <span class="label-text">${item[label]}</span>
          <input type="radio" name="projectOrFile" id="${label}${index}" value="${index}" class="radio radio-primary" ${index === 0 ? 'checked' : ''
            }>
        </label>`
        )
        .join('');
    }
  }

  fetchActivityData(formData: any): void {
    const uid = this.cookieService.get('uid'); // ดึง user id จาก cookie
    if (!uid) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'User ID not found in cookies',
      });
      return;
    }

    // GraphQL query สำหรับดึงข้อมูล activity ของผู้ใช้
    const userQuery = gql`
      query GetUserActivity($uid: ID!) {
        activity(uid: $uid) {
          Languages
          wordcount
          coins
          time
          Timestamp
          code_references
          paste_count
          project_name
        }
      }
    `;

    // ดึงข้อมูล activity จาก GraphQL
    this.apollo
      .watchQuery({
        query: userQuery,
        variables: { uid: uid },
      })
      .valueChanges.subscribe(
        (response: any) => {
          const activityData = response.data.activity;
          console.log('Activity Data:', activityData); // ตรวจสอบข้อมูลใน console
          this.createReportForProjectGroup(formData, activityData); // ส่ง formData และ activityData ไปยัง createReport
        },
        (error: any) => {
          console.error('Error fetching user data:', error);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: `Failed to fetch user data: ${error.message}`,
          });
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
