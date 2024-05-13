import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import ApexCharts from 'apexcharts';
import { DataService } from '../service/data.service';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
generateToken() {
throw new Error('Method not implemented.');
}
  activityCoins: any[] = [];
  foodStatus: String | undefined = "I";
  socialStatus: String | undefined = "I";
  todayCodeTime: Number | undefined = 0;
  monthlyCodeTime: Number | undefined = 0;
  todayTimeCompare: Number | undefined = 0;
  monthlyTimeCompare: Number | undefined = 0;
  todayCoins: Number | undefined = 0;
  totalCoins: number[] | undefined;
  token: string | undefined;

  constructor(private authService: AuthService, private router: Router, private http: HttpClient, private dataService: DataService) { }

  ngOnInit(): void {
    // เรียกใช้งาน DataService เพื่อดึงข้อมูล Coins
    this.dataService.getActivityCoins().subscribe(coins => {
      // กำหนดค่าของ totalCoins จากข้อมูลที่ได้
      this.totalCoins = coins as number[];
    });
    // เรียกใช้งานฟังก์ชันเพื่อดึงข้อมูลอื่นๆ
    this.getdata();
    // เรียกใช้งาน ApexCharts เมื่อคอมโพเนนต์ถูกโหลด
    this.initializeChart();
    this.checkActivityCoins();
  }

  getdata() {
    this.authService.fetchuserdata().subscribe(
      (data) => {
        console.log(data);
      },
      (error) => {
        console.error(error);
      }
    );
  }

  checkActivityCoins() {
    this.http.get('/api/activity-coins').subscribe((data: any) => {
      console.log('Activity coins:', data);
    }, (error) => {
      console.error('Error getting activity coins:', error);
    });
  }
  initializeChart() {
    if (document.getElementById("donut-chart") && typeof ApexCharts !== 'undefined') {
      const chart = new ApexCharts(document.getElementById("donut-chart"), this.getChartOptions());
      chart.render();
    }
  }

  getChartOptions() {
    return {
      series: [35.1, 23.5, 2.4, 5.4],
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
                  const sum = w.globals.seriesTotals.reduce((a: any, b: any) => {
                    return a + b
                  }, 0)
                  return sum
                },
              },
              value: {
                show: true,
                fontFamily: "Inter, sans-serif",
                offsetY: -20,
                formatter: function (value: string) {
                  return value + "k"
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
      labels: ["Python", "Java", "Typescript", "CSS"],
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
            return value + "k"
          },
        },
      },
      xaxis: {
        labels: {
          formatter: function (value: string) {
            return value + "k"
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
}
