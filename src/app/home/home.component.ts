import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { Apollo } from 'apollo-angular';
import { CookieService } from 'ngx-cookie-service';
import gql from 'graphql-tag';
import ApexCharts from 'apexcharts';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
removeToken() {
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
  totalCoins: Number | undefined;
  hidden: any;

  constructor(
    private authService: AuthService,
    private router: Router,
    private apollo: Apollo,
    private cookieService: CookieService
  ) { }

  ngOnInit(): void {
    this.getTotalCoins();
    this.getTodayCoins();
    this.initializeChart();
    this.getTime();
  }

  generateToken() {
    const token = this.cookieService.get('email'); // get token from cookie
    if (token !== null) {
      this.authService.setExtensionsToken(token).subscribe(
        (response) => {
          console.log(response);
          const firstObject = Object.values(response)[0];
          if (typeof firstObject === 'string') {
            Swal.fire({
              icon: 'info',
              title: 'Your Extensions Token',
              text: `${firstObject}`,
            });
          } else {
            console.error('Unexpected response format:', response);
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'Unexpected response format. Please try again.',
            });
          }
        },
        (error) => {
          console.log(error);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Failed to generate Extensions Token. Please try again.',
          });
        }
      );
    } else {
      console.error('Token not found in localStorage');
    }
  }

  getTotalCoins(): void {
    this.apollo
      .watchQuery({
        query: gql`
          {
            totalCoins
          }
        `
      })
      .valueChanges
      .subscribe(
        (response: any) => {
          this.totalCoins = response.data.totalCoins;
        },
        (error: any) => {
          console.error('Error getting total coins:', error);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: `Failed to get total coins: ${error.message}`,
          });
        }
      );
  }

  getTodayCoins(): void {
    const email = this.cookieService.get('email');
    if (email) {
      this.apollo
        .watchQuery({
          query: gql`
            query GetCoins($email: String!) {
              coins(email: $email)
            }
          `,
          variables: {
            email: email
          }
        })
        .valueChanges
        .subscribe(
          (response: any) => {
            this.todayCoins = response.data.coins;
          },
          (error: any) => {
            console.error('Error getting today coins:', error);
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: `Failed to get today coins: ${error.message}`,
            });
          }
        );
    } else {
      console.error('Token not found in cookies');
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Email token not found in cookies',
      });
    }
  }

  getTime(): void {
    const email = this.cookieService.get('email');
    if (email !== null) {
      this.apollo
        .watchQuery({
          query: gql`
            query GetTime($email: String!) {
              time(email: $email)
            }
          `,
          variables: {
            email: email
          }
        })
        .valueChanges
        .subscribe(
          (response: any) => {
            const timeInUnits = response.data.time / 10000; // Divide by 10000
            this.todayCodeTime = parseFloat(timeInUnits.toFixed(2)); // Round to 2 decimal places
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

  initializeChart(): void {
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
                  const sum = w.globals.seriesTotals.reduce((a: any, b: any) => a + b, 0);
                  return sum;
                },
              },
              value: {
                show: true,
                fontFamily: "Inter, sans-serif",
                offsetY: -20,
                formatter: function (value: string) {
                  return value + "k";
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
            return value + "k";
          },
        },
      },
      xaxis: {
        labels: {
          formatter: function (value: string) {
            return value + "k";
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
