import { Injectable } from '@angular/core';
import ApexCharts from 'apexcharts';

@Injectable({
  providedIn: 'root'
})
export class ChartService {

  initializeChart(timeByLanguage: any[]): void {
    const chartContainer = document.getElementById("donut-chart");
    if (chartContainer && typeof ApexCharts !== 'undefined') {
      while (chartContainer.firstChild) {
        chartContainer.removeChild(chartContainer.firstChild);
      }

      if (timeByLanguage.length > 0) {
        const chart = new ApexCharts(chartContainer, this.getChartOptions(timeByLanguage));
        chart.render();
      } else {
        console.warn('No data available for chart');
      }
    }
  }

  private getChartOptions(timeByLanguage: any[]): any {
    return {
      series: timeByLanguage.map((data: any) => data.total_time),
      labels: timeByLanguage.map((data: any) => data.language),
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
}
