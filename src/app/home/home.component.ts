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

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})


export class HomeComponent implements OnInit, AfterViewInit {
  totalPages: number | undefined;
  petPath: any;
  selectedLanguage: string = 'en';
  toggleInfoModal() {
    this.showInfoModal = !this.showInfoModal;
    
  }

  showActivity = false;
  showInventory = false;
  showStore = false;
  showDecoration = false;
  genres = ['All', 'Foods', 'Decoration'];
  selectedGenre = 'All';
  petName: String | undefined = 'David';
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
      940: { items: 4 },
    },
    nav: true,
  };
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
    if (uid !== null) {
      this.apollo
        .watchQuery({
          query: gql`
            query GetTime($uid: String!) {
              time(uid: $uid)
            }
          `,
          variables: {
            uid: uid,
          },
        })
        .valueChanges.subscribe(
          (response: any) => {
            const timeInUnits = response.data.time / 10000;
            this.todayCodeTime = parseFloat(timeInUnits.toFixed(2));
          },
          (error) => {
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
    this.apollo
      .subscribe({
        query: gql`
          subscription OnTimeByLanguageUpdated {
            timeByLanguageUpdated {
              language
              total_time
            }
          }
        `,
      })
      .subscribe((result: any) => {
        this.timeByLanguage = result.data.timeByLanguageUpdated;
        this.initializeChart(); // Re-render chart with updated data
      });
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
              }
            }
          `,
          variables: {
            uid: uid,
          },
        })
        .valueChanges.subscribe(
          (response: any) => {
            this.activityData = response.data.activity.map((activity: any) => ({
              ...activity,
              Timestamp: this.cleanTimestamp(activity.Timestamp), // แปลง timestamp โดยใช้ Date object
            }));
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

    // รูปแบบใหม่: h:mm:ss a, MMMM Do YYYY
    const hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    const period = hours >= 12 ? 'PM' : 'AM';
    const day = String(date.getDate()).padStart(2, '0');
    const month = date.toLocaleString('default', { month: 'long' });
    const year = date.getFullYear();

    return `${
      hours % 12
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
          variables: {
            uid: uid,
          },
          pollInterval: 3000000, // Polling ทุกๆ 5 นาที (300,000 มิลลิวินาที)
        })
        .valueChanges.subscribe(
          (response: any) => {
            const pet = response.data.userPets[0]; // สมมติว่าเราดึงสัตว์เลี้ยงตัวแรก
            this.petName = pet.pet_name;
            this.foodStatus = pet.hunger_level; // อัปเดตค่า hunger_level
            this.happinessStatus = 40; // ค่า happiness ที่กำหนดเอง
            this.exp = pet.exp;
            this.petPath = pet.path;
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

  selectFoodItem(item: any) {
    const petId = 1; // ตัวอย่าง petId
    this.feedPet(petId, item.food_value, item.item_id);
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

  feedPet(petId: number, foodValue: number, itemId: number): void {
    const uid = this.cookieService.get('uid');
    if (uid) {
      this.userService.feedPet(uid, petId, foodValue, itemId).subscribe(
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

    const formattedStartDate = `${startDate.getDate()}/${
      startDate.getMonth() + 1
    }/${startDate.getFullYear()}`;
    const formattedEndDate = `${endDate.getDate()}/${
      endDate.getMonth() + 1
    }/${endDate.getFullYear()}`;
    return `${formattedStartDate} - ${formattedEndDate}`;
  }

  cleanTimestamp(timestamp: string | number | null | undefined): string {
    console.log('Original timestamp:', timestamp); // ตรวจสอบค่า timestamp ดั้งเดิม

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
    console.log('Parsed timestamp as number:', timestampNum); // ตรวจสอบค่าหลังจากแปลงเป็นตัวเลข

    if (isNaN(timestampNum)) {
      console.log('Invalid timestamp after parsing:', timestampNum);
      return 'Invalid date';
    }

    // แปลง Unix timestamp เป็น Date object
    const dateObj = new Date(timestampNum);
    console.log('Date object:', dateObj); // ตรวจสอบค่า Date object

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
    console.log('Formatted date:', formattedDate); // ตรวจสอบรูปแบบวันที่สุดท้าย

    return formattedDate;
  }

  generateReport(): void {
    const uid = this.cookieService.get('uid');
    this.apollo
      .watchQuery({
        query: gql`
          query GetActivityWithFiles($uid: ID!) {
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
        variables: { uid: uid },
      })
      .valueChanges.subscribe((response: any) => {
        const activityData = response.data.activity;

        const aggregatedProjectsByName = activityData.reduce(
          (acc: any, project: any) => {
            const existingProject = acc.find(
              (p: any) => p.project_name === project.project_name
            );
            if (existingProject) {
              const existingFile = existingProject.files.find(
                (f: any) => f.file_name === project.file_name
              );
              if (existingFile) {
                existingFile.time += project.time;
                existingFile.wordcount += project.wordcount;
                existingFile.coins += project.coins;
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
          },
          []
        );

        Swal.fire({
          title: 'Create Report',
          html: `
          <label for="name" class="label">Name</label>
          <input id="name" class="input input-bordered w-full max-w-xs swal2-input" placeholder="Your Name">
  
          <div style="text-align: left; margin-top: 20px;">
            <label class="label"><span class="label-text">Select project:</span></label><br>
            ${aggregatedProjectsByName
              .map(
                (project: { project_name: any }, index: number) =>
                  `<label class="label cursor-pointer">
                  <span class="label-text">${project.project_name}</span>
                  <input type="radio" name="project" id="project${index}" value="${index}" class="radio radio-primary" ${
                    index === 0 ? 'checked' : ''
                  }>
                </label>`
              )
              .join('')}
          </div>
  
          <div id="fileSelectionContainer" style="text-align: left; margin-top: 20px;"></div>
  
          <div style="text-align: left; margin-top: 20px;">
            <label class="label"><span class="label-text">Select details:</span></label><br>
            <label class="label cursor-pointer">
              <span class="label-text">Total Time</span>
              <input type="checkbox" id="totalTime" value="totalTime" class="checkbox checkbox-primary" checked>
            </label>
            <label class="label cursor-pointer">
              <span class="label-text">Word Count</span>
              <input type="checkbox" id="wordCount" value="wordCount" class="checkbox checkbox-primary" checked>
            </label>
            <label class="label cursor-pointer">
              <span class="label-text">Coins Earned</span>
              <input type="checkbox" id="coinsEarned" value="coinsEarned" class="checkbox checkbox-primary" checked>
            </label>
            <label class="label cursor-pointer">
              <span class="label-text">Timestamp</span>
              <input type="checkbox" id="timestampChecked" value="timestampChecked" class="checkbox checkbox-primary" checked>
            </label>
          </div>
        `,
          showCancelButton: true,
          confirmButtonText: 'Create Report',
          didOpen: () => {
            const projectRadios = document.querySelectorAll(
              'input[name="project"]'
            );
            projectRadios.forEach((radio: any) => {
              radio.addEventListener('change', () => {
                const selectedProjectIndex = radio.value;
                this.populateFileSelection(
                  aggregatedProjectsByName[selectedProjectIndex].files
                );
              });
            });

            this.populateFileSelection(aggregatedProjectsByName[0].files);
          },
          preConfirm: () => {
            const name = (document.getElementById('name') as HTMLInputElement)
              .value;
            const selectedProjectElement = document.querySelector(
              'input[name="project"]:checked'
            ) as HTMLInputElement;
            const selectedProjectIndex = selectedProjectElement
              ? selectedProjectElement.value
              : undefined;

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

            const selectedFiles = Array.from(
              document.querySelectorAll('input[name="file"]:checked')
            ).map((checkbox: any) => checkbox.value);

            if (!name) {
              Swal.showValidationMessage('Please enter your name');
              return;
            }

            if (selectedProjectIndex === undefined) {
              Swal.showValidationMessage('Please select a project');
              return;
            }

            if (selectedFiles.length === 0) {
              Swal.showValidationMessage('Please select at least one file');
              return;
            }

            return {
              name,
              selectedProjectIndex,
              selectedFiles,
              totalTimeChecked,
              wordCountChecked,
              coinsEarnedChecked,
              timestampChecked,
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
        });
      });
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
              <input type="checkbox" name="file" value="${
                file.file_name
              }" class="checkbox checkbox-primary" ${
                index === 0 ? 'checked' : ''
              }>
            </label>`
          )
          .join('')}
      `;
    }
  }

  createReportForProjectGroup(
    name: string,
    projectFiles: any[],
    selectedDetails: any = {
      totalTimeChecked: true,
      wordCountChecked: true,
      coinsEarnedChecked: true,
      timestampChecked: true,
    }
  ): void {
    let reportHtml = `
      <div style="padding: 20px; font-family: Arial, sans-serif; border: 1px solid #ccc; border-radius: 10px; max-width: 800px; margin: 20px auto;">
        <h1 style="color: #FF6B6B; text-align: center;">PawsPal</h1>
        <h2 style="text-align: center; color: #333;">Activity Report</h2>
        <h3 style="text-align: center; color: #555;">${name}</h3>
        <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
          <thead>
            <tr style="background-color: #f8f8f8;">
              <th style="padding: 10px; text-align: left;">File Name</th>
              ${
                selectedDetails.timestampChecked
                  ? `<th style="padding: 10px; text-align: left;">Start Date</th><th style="padding: 10px; text-align: left;">End Date</th>`
                  : ''
              }
              ${
                selectedDetails.totalTimeChecked
                  ? `<th style="padding: 10px; text-align: left;">Total Time</th>`
                  : ''
              }
              ${
                selectedDetails.wordCountChecked
                  ? `<th style="padding: 10px; text-align: left;">Word Count</th>`
                  : ''
              }
              ${
                selectedDetails.coinsEarnedChecked
                  ? `<th style="padding: 10px; text-align: left;">Coins Earned</th>`
                  : ''
              }
            </tr>
          </thead>
          <tbody>
    `;

    projectFiles.forEach((file) => {
      const fileTimestamp = parseInt(file.Timestamp, 10);
      const startDate = new Date(fileTimestamp); // กำหนด startDate จาก timestamp

      // คำนวณ endDate โดยเพิ่มเวลาเท่ากับเวลาที่ใช้ทำงานของไฟล์นั้น ๆ (time)
      const endDate = new Date(fileTimestamp + file.time * 60 * 1000); // time เป็นนาที แปลงเป็นมิลลิวินาที

      reportHtml += `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #ddd;">${
            file.file_name
          }</td>
          ${
            selectedDetails.timestampChecked
              ? `<td style="padding: 10px; border-bottom: 1px solid #ddd;">${moment(
                  startDate
                ).format(
                  'YYYY-MM-DD HH:mm:ss'
                )}</td><td style="padding: 10px; border-bottom: 1px solid #ddd;">${moment(
                  endDate
                ).format('YYYY-MM-DD HH:mm:ss')}</td>`
              : ''
          }
          ${
            selectedDetails.totalTimeChecked
              ? `<td style="padding: 10px; border-bottom: 1px solid #ddd;">${(
                  file.time / 60
                ).toFixed(2)} hours</td>`
              : ''
          }
          ${
            selectedDetails.wordCountChecked
              ? `<td style="padding: 10px; border-bottom: 1px solid #ddd;">${file.wordcount}</td>`
              : ''
          }
          ${
            selectedDetails.coinsEarnedChecked
              ? `<td style="padding: 10px; border-bottom: 1px solid #ddd;">${file.coins.toFixed(
                  2
                )}</td>`
              : ''
          }
        </tr>
      `;
    });

    reportHtml += `
        </tbody>
      </table>
      <p style="text-align: right; margin-top: 20px;">SN:4815165sa561dsa</p>
    </div>`;

    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.write(reportHtml);
      newWindow.document.close();
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

  // ฟังก์ชันสำหรับดึงข้อมูล activityData จากเซิร์ฟเวอร์
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
