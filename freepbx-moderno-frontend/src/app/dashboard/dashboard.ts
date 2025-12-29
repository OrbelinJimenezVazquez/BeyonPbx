import { Component, OnInit, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { ApiService } from '../core/api.service';
import { DecimalPipe } from '@angular/common';

declare var Chart: any;

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [DecimalPipe],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css'],
})
export class DashboardComponent implements OnInit {
  stats: any = {};
  loading = false;

  // Referencias a canvas
  @ViewChild('statusChart') statusChartRef!: ElementRef;
  @ViewChild('waitChart') waitChartRef!: ElementRef;
  @ViewChild('agentChart') agentChartRef!: ElementRef;
  @ViewChild('trendChart') trendChartRef!: ElementRef;
  @ViewChild('destChart') destChartRef!: ElementRef;

  statusChart: any;
  waitChart: any;
  agentChart: any;
  trendChart: any;
  destChart: any;

  constructor(
  private api: ApiService,
  private cdr: ChangeDetectorRef
) {}

  loadStats() {
    this.loading = true;
    this.api.getAdvancedDashboardStats().subscribe({
      next: (data) => {
        this.stats = data;
        this.loading = false;
        this.cdr.detectChanges();
        setTimeout(() => {
          this.createCharts();
        }, 100);
      },
      error: (err) => {
        console.error('Error:', err);
        this.loading = false;
      }
    });
  }

  createCharts() {
    // 1. Gráfico de estado de llamadas (pastel)
    if (this.statusChartRef && this.stats.call_status) {
      const ctx1 = this.statusChartRef.nativeElement.getContext('2d');
      this.statusChart = new Chart(ctx1, {
        type: 'doughnut',
        data: {
          labels: ['Contestadas', 'No contestadas', 'Fallidas', 'Ocupadas'],
          datasets: [{
            data: [
              this.stats.call_status.answered,
              this.stats.call_status.no_answer,
              this.stats.call_status.failed,
              this.stats.call_status.busy
            ],
            backgroundColor: [
              '#10b981', '#ef4444', '#f59e0b', '#8b5cf6'
            ]
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'bottom'
            }
          }
        }
      });
    }

    // 2. Tiempos de espera promedio (barras)
    if (this.waitChartRef && this.stats.wait_times.length > 0) {
      const ctx2 = this.waitChartRef.nativeElement.getContext('2d');
      this.waitChart = new Chart(ctx2, {
        type: 'bar',
        data: {
          labels: this.stats.wait_times.map((w: any) => w.extension),
          datasets: [{
            label: 'Tiempo de espera (seg)',
            data: this.stats.wait_times.map((w: any) => w.avg_wait_time),
            backgroundColor: 'rgba(59, 130, 246, 0.6)',
            borderColor: 'rgba(59, 130, 246, 1)',
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          scales: {
            y: { beginAtZero: true }
          }
        }
      });
    }

    // 3. Top agentes (barras horizontales)
    if (this.agentChartRef && this.stats.top_agents.length > 0) {
      const ctx3 = this.agentChartRef.nativeElement.getContext('2d');
      this.agentChart = new Chart(ctx3, {
        type: 'bar', // o 'bar' con datasets horizontal
        data: {
          labels: this.stats.top_agents.map((a: any) => `${a.name} (${a.extension})`),
          datasets: [{
            label: 'Llamadas contestadas',
            data: this.stats.top_agents.map((a: any) => a.answered_calls),
            backgroundColor: 'rgba(16, 185, 129, 0.6)',
            borderColor: 'rgba(16, 185, 129, 1)',
            borderWidth: 1
          }]
        },
        options: {
          indexAxis: 'y', // para barras horizontales
          responsive: true,
          scales: {
            x: { beginAtZero: true }
          }
        }
      });
    }

    // 4. Tendencia de llamadas (línea)
    if (this.trendChartRef && this.stats.daily_trends.length > 0) {
      const ctx4 = this.trendChartRef.nativeElement.getContext('2d');
      this.trendChart = new Chart(ctx4, {
        type: 'line',
        data: {
          labels: this.stats.daily_trends.map((d: any) => d.date),
          datasets: [
            {
              label: 'Total',
              data: this.stats.daily_trends.map((d: any) => d.total),
              borderColor: 'rgba(59, 130, 246, 1)',
              tension: 0.1
            },
            {
              label: 'Contestadas',
              data: this.stats.daily_trends.map((d: any) => d.answered),
              borderColor: 'rgba(16, 185, 129, 1)',
              tension: 0.1
            }
          ]
        },
        options: {
          responsive: true,
          scales: {
            y: { beginAtZero: true }
          }
        }
      });
    }

    // 5. Distribución por tipo (pastel)
    if (this.destChartRef && this.stats.destination_distribution.length > 0) {
      const ctx5 = this.destChartRef.nativeElement.getContext('2d');
      this.destChart = new Chart(ctx5, {
        type: 'pie',
        data: {
          labels: this.stats.destination_distribution.map((d: any) => d.type),
          datasets: [{
            data: this.stats.destination_distribution.map((d: any) => d.calls),
            backgroundColor: [
              '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
              '#ec4899', '#06b6d4', '#f97316', '#64748b', '#14b8a6'
            ]
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'bottom'
            }
          }
        }
      });
    }
  }

  downloadPdf() {
    alert('Funcionalidad de descarga de PDF en desarrollo.');
  }

  ngOnInit(): void {
    this.loadStats();
  }

  ngOnDestroy() {
    [this.statusChart, this.waitChart, this.agentChart, this.trendChart, this.destChart]
      .filter(chart => chart)
      .forEach(chart => chart.destroy());
  }
}