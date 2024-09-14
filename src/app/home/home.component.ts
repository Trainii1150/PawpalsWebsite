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
              project_name
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
          // แปลง timestamp เป็น Date ในที่เดียวทันทีหลังรับข้อมูล
          this.activityData = response.data.activity.map((activity: any) => ({
            ...activity,
            Timestamp: this.cleanTimestamp(activity.Timestamp)  // แปลง string timestamp เป็น Date ที่จัดรูปแบบ
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
  
    return `${hours % 12}:${minutes}:${seconds} ${period}, ${month} ${day} ${year}`;
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

  formatTimestampToActiveDays(timestamp: string | null | undefined): string {
    if (!timestamp) {
      // ถ้า timestamp เป็น null หรือ undefined ให้แสดงข้อความที่เหมาะสม
      return 'No start date available - ' + moment(new Date()).format('DD/MM/YYYY');
    }
  
    const startDate = new Date(parseInt(timestamp));
    const endDate = new Date();
  
    if (isNaN(startDate.getTime())) {
      // ถ้าการแปลง timestamp ไม่ถูกต้อง ให้แสดงวันที่สิ้นสุดเพียงอย่างเดียว
      return 'No start date available - ' + moment(endDate).format('DD/MM/YYYY');
    }
  
    const formattedStartDate = `${startDate.getDate()}/${startDate.getMonth() + 1}/${startDate.getFullYear()}`;
    const formattedEndDate = `${endDate.getDate()}/${endDate.getMonth() + 1}/${endDate.getFullYear()}`;
    return `${formattedStartDate} - ${formattedEndDate}`;
  }
  
  
// ฟังก์ชันสร้างรายงานสำหรับโปรเจกต์ที่รวมข้อมูล
createReportForProjectGroup(name: string, projectGroup: any[], selectedDetails: any = { totalTimeChecked: true, activeDaysChecked: true, wordCountChecked: true, coinsEarnedChecked: true }): void {
  // หาวันที่เริ่มต้นและวันที่สิ้นสุด
  const timestamps = projectGroup.map(project => new Date(project.Timestamp));
  const startDate = new Date(Math.min(...timestamps.map(t => t.getTime())));
  const endDate = new Date(Math.max(...timestamps.map(t => t.getTime())));
  

  // รวมค่าต่างๆ
  const totalTime = projectGroup.reduce((sum, project) => sum + project.time, 0);
  const totalWordCount = projectGroup.reduce((sum, project) => sum + project.wordcount, 0);
  const totalCoins = projectGroup.reduce((sum, project) => sum + project.coins, 0);

  let reportHtml = `
    <div style="padding: 20px; font-family: Arial, sans-serif; border: 1px solid #ccc; border-radius: 10px; max-width: 800px; margin: 20px auto;">
      <h1 style="color: #FF6B6B; text-align: center;">PawsPal</h1>
      <h2 style="text-align: center; color: #333;">รายงานกิจกรรม</h2>
      <h3 style="text-align: center; color: #555;">${name}</h3>
      <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
        <thead>
          <tr style="background-color: #f8f8f8;">
            <th style="padding: 10px; text-align: left;">ชื่อโปรเจกต์</th>
  `;

  // เพิ่ม header ตามรายละเอียดที่ผู้ใช้เลือก
  if (selectedDetails.totalTimeChecked) reportHtml += `<th style="padding: 10px; text-align: left;">เวลาทั้งหมด</th>`;
  if (selectedDetails.activeDaysChecked) reportHtml += `<th style="padding: 10px; text-align: left;">ช่วงวันที่ทำงาน</th>`;
  if (selectedDetails.wordCountChecked) reportHtml += `<th style="padding: 10px; text-align: left;">จำนวนคำ</th>`;
  if (selectedDetails.coinsEarnedChecked) reportHtml += `<th style="padding: 10px; text-align: left;">เหรียญที่ได้</th>`;

  reportHtml += `</tr></thead><tbody><tr><td style="padding: 10px; border-bottom: 1px solid #ddd;">${projectGroup[0].project_name}</td>`;

  // เพิ่มข้อมูลตามรายละเอียดที่ผู้ใช้เลือก
  if (selectedDetails.totalTimeChecked) reportHtml += `<td style="padding: 10px; border-bottom: 1px solid #ddd;">${(totalTime / 60).toFixed(2)} ชั่วโมง</td>`;
  if (selectedDetails.activeDaysChecked) reportHtml += `<td style="padding: 10px; border-bottom: 1px solid #ddd;">${moment(startDate).format('DD/MM/YYYY')} - ${moment(endDate).format('DD/MM/YYYY')}</td>`;
  if (selectedDetails.wordCountChecked) reportHtml += `<td style="padding: 10px; border-bottom: 1px solid #ddd;">${totalWordCount}</td>`;
  if (selectedDetails.coinsEarnedChecked) reportHtml += `<td style="padding: 10px; border-bottom: 1px solid #ddd;">${totalCoins.toFixed(2)}</td>`;

  reportHtml += `
      </tr>
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



cleanTimestamp(timestamp: string | number): string {
  // ตรวจสอบว่า timestamp เป็นตัวเลขหรือไม่
  const timestampNum = Number(timestamp);
  if (isNaN(timestampNum)) {
    return 'Invalid date';
  }

  // แปลง timestamp ที่เป็น Unix time (หน่วยมิลลิวินาที) เป็น Date object
  const dateObj = new Date(timestampNum);

  // ตรวจสอบว่าเป็นวันที่ถูกต้องหรือไม่
  if (isNaN(dateObj.getTime())) {
    return 'Invalid date';
  }

  // จัดรูปแบบเป็น YYYY-MM-DD HH:mm
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0'); // เดือนนับจาก 0
  const day = String(dateObj.getDate()).padStart(2, '0');
  const hours = String(dateObj.getHours()).padStart(2, '0');
  const minutes = String(dateObj.getMinutes()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}`;
}


generateReport(): void {
  const aggregatedProjects = this.activityData.reduce((acc: any, project: any) => {
    const existingProject = acc.find((p: any) => p.project_name === project.project_name);
    if (existingProject) {
      existingProject.wordcount += project.wordcount;
      existingProject.coins += project.coins;
      existingProject.time += project.time;
      existingProject.timestamps.push(this.cleanTimestamp(project.Timestamp));  // ใช้ cleanTimestamp ที่ปรับปรุงแล้ว
    } else {
      acc.push({
        ...project,
        timestamps: [this.cleanTimestamp(project.Timestamp)]  // ใช้ cleanTimestamp ที่ปรับปรุงแล้ว
      });
    }
    return acc;
  }, []);

  Swal.fire({
    title: 'สร้างรายงาน',
    html: `
      <label for="name" class="label">ใส่ชื่อของคุณ</label>
      <input id="name" class="input input-bordered w-full max-w-xs swal2-input" placeholder="Your Name">
      
      <div style="text-align: left; margin-top: 20px;">
        <label class="label"><span class="label-text">เลือกโปรเจกต์:</span></label><br>
        ${aggregatedProjects.map(
          (project: { project_name: any; }, index: number) =>
            `<label class="label cursor-pointer">
              <span class="label-text">${project.project_name}</span>
              <input type="radio" name="project" id="project${index}" value="${index}" class="radio radio-primary" ${index === 0 ? 'checked' : ''}>
            </label>`
        ).join('')}
      </div>

      <div style="text-align: left; margin-top: 20px;">
        <label class="label"><span class="label-text">เลือกข้อมูลที่ต้องการแสดง:</span></label><br>
        <label class="label cursor-pointer">
          <span class="label-text">เวลาทั้งหมด</span>
          <input type="checkbox" id="totalTime" value="totalTime" class="checkbox checkbox-primary" checked>
        </label>
        <label class="label cursor-pointer">
          <span class="label-text">วันทำงาน</span>
          <input type="checkbox" id="activeDays" value="activeDays" class="checkbox checkbox-primary" checked>
        </label>
        <label class="label cursor-pointer">
          <span class="label-text">จำนวนคำ</span>
          <input type="checkbox" id="wordCount" value="wordCount" class="checkbox checkbox-primary" checked>
        </label>
        <label class="label cursor-pointer">
          <span class="label-text">เหรียญที่ได้</span>
          <input type="checkbox" id="coinsEarned" value="coinsEarned" class="checkbox checkbox-primary" checked>
        </label>
      </div>
    `,
    showCancelButton: true,
    confirmButtonText: 'สร้างรายงาน',
    preConfirm: () => {
      const name = (document.getElementById('name') as HTMLInputElement).value;
      const selectedProjectElement = document.querySelector('input[name="project"]:checked') as HTMLInputElement;
      const selectedProjectIndex = selectedProjectElement ? selectedProjectElement.value : undefined;

      const totalTimeChecked = (document.getElementById('totalTime') as HTMLInputElement).checked;
      const activeDaysChecked = (document.getElementById('activeDays') as HTMLInputElement).checked;
      const wordCountChecked = (document.getElementById('wordCount') as HTMLInputElement).checked;
      const coinsEarnedChecked = (document.getElementById('coinsEarned') as HTMLInputElement).checked;

      if (!name) {
        Swal.showValidationMessage('กรุณาใส่ชื่อของคุณ');
        return;
      }

      if (selectedProjectIndex === undefined) {
        Swal.showValidationMessage('กรุณาเลือกโปรเจกต์');
        return;
      }

      return {
        name,
        selectedProjectIndex,
        totalTimeChecked,
        activeDaysChecked,
        wordCountChecked,
        coinsEarnedChecked
      };
    }
  }).then((result: any) => {
    if (result.isConfirmed) {
      const formData = result.value;
      const selectedProject = aggregatedProjects[formData.selectedProjectIndex]; 
      
      // สร้าง array ของ project ที่มีชื่อเดียวกันจาก aggregatedProjects
      const projectsWithSameName = this.activityData.filter(p => p.project_name === selectedProject.project_name);

      // เรียกใช้ createReportForProjectGroup พร้อมข้อมูลที่รวมแล้ว
      this.createReportForProjectGroup(formData.name, projectsWithSameName, formData);  
    }
  });
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
