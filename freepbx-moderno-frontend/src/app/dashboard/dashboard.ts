// src/app/dashboard/dashboard.ts
import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { ApiService } from '../core/api.service';
import { PdfService } from '../core/pdf.service';
import { DecimalPipe } from '@angular/common';
import { Chart, registerables } from 'chart.js';


Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [DecimalPipe],
  templateUrl: `./dashboard.html`,
  styleUrls: [`./dashboard.css`, ]
})

export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  stats: any = {
    general: {},
    call_status: {},
    daily_trends: [],
    top_agents: [],
    destination_distribution: []
  };
  loading = false;

  @ViewChild('dashboardContainer') dashboardContainer!: ElementRef;
  @ViewChild('statusChart') statusChartRef!: ElementRef;
  @ViewChild('trendChart') trendChartRef!: ElementRef;
  @ViewChild('agentChart') agentChartRef!: ElementRef;
  @ViewChild('destChart') destChartRef!: ElementRef;

  private statusChart: Chart | null = null;
  private trendChart: Chart | null = null;
  private agentChart: Chart | null = null;
  private destChart: Chart | null = null;

  constructor(
    private api: ApiService,
    private pdfService: PdfService,
    private cdr: ChangeDetectorRef
  ) {}
  
  loadStats(): void {
    this.loading = true;
    this.api.getAdvancedDashboardStats().subscribe({
      next: (data) => {
        this.stats = data;
        this.loading = false;
        // Asegurar que el DOM esté actualizado antes de crear gráficos
        this.cdr.detectChanges();
        setTimeout(() => {
          this.createCharts();
        }, 100);
      },
      error: (err) => {
        console.error('Error cargando estadísticas:', err);
        this.loading = false;
      }
    });
  }

  private createCharts(): void {
    // Asegurar que los elementos estén disponibles
    setTimeout(() => {
      this.createStatusChart();
      this.createTrendChart();
      this.createAgentChart();
      this.createDestChart();
    }, 50);
  }

  private createStatusChart(): void {
    if (!this.statusChartRef?.nativeElement || !this.stats.call_status) {
      return;
    }

    this.destroyChart(this.statusChart);
    
    const ctx = this.statusChartRef.nativeElement.getContext('2d');
    this.statusChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Contestadas', 'No contestadas', 'Fallidas', 'Ocupadas'],
        datasets: [{
          data: [
            this.stats.call_status.answered || 0,
            this.stats.call_status.no_answer || 0,
            this.stats.call_status.failed || 0,
            this.stats.call_status.busy || 0
          ],
          backgroundColor: [
            '#10b981', '#ef4444', '#f59e0b', '#8b5cf6'
          ]
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom'
          }
        }
      }
    });
  }

  private createTrendChart(): void {
    if (!this.trendChartRef?.nativeElement || !this.stats.daily_trends || this.stats.daily_trends.length === 0) {
      return;
    }

    this.destroyChart(this.trendChart);
    
    const ctx = this.trendChartRef.nativeElement.getContext('2d');
    this.trendChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: this.stats.daily_trends.map((d: any) => d.date),
        datasets: [
          {
            label: 'Total',
            data: this.stats.daily_trends.map((d: any) => d.total || 0),
              borderColor: 'rgba(46, 134, 171, 1)', // Ocean Blue
              //borderColor: 'rgba(40, 167, 69, 1)', // Green
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
            tension: 0.1,
            fill: false
          },
          {
            label: 'Contestadas',
            data: this.stats.daily_trends.map((d: any) => d.answered || 0),
            borderColor: 'rgba(16, 185, 129, 1)',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            tension: 0.1,
            fill: false
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: { beginAtZero: true }
        }
      }
    });
  }

  private createAgentChart(): void {
    if (!this.agentChartRef?.nativeElement || !this.stats.top_agents || this.stats.top_agents.length === 0) {
      return;
    }

    this.destroyChart(this.agentChart);
    
    const ctx = this.agentChartRef.nativeElement.getContext('2d');
    this.agentChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: this.stats.top_agents.map((a: any) => `${a.name} (${a.extension})`),
        datasets: [{
          label: 'Llamadas contestadas',
          data: this.stats.top_agents.map((a: any) => a.answered_calls || 0),
          backgroundColor: 'rgba(40, 167, 69, 0.6)',
          borderColor: 'rgba(16, 185, 129, 1)',
          borderWidth: 1
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { beginAtZero: true }
        }
      }
    });
  }

  private createDestChart(): void {
    if (!this.destChartRef?.nativeElement || !this.stats.destination_distribution || this.stats.destination_distribution.length === 0) {
      return;
    }

    this.destroyChart(this.destChart);
    
    const ctx = this.destChartRef.nativeElement.getContext('2d');
    this.destChart = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: this.stats.destination_distribution.map((d: any) => d.type),
        datasets: [{
          data: this.stats.destination_distribution.map((d: any) => d.calls || 0),
          backgroundColor: [
            '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
            '#2E86AB', '#DC3545', '#28A745', '#FFC107', '#043742',  // Ocean Blue, Raspberry, Medium Jungle, Amber Gold, Dark Teal
            '#6C757D', '#6CCFF6', '#F8F9FA', '#E9ECEF', '#212529'
          ]
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom'
          }
        }
      }
    });
  }

  private destroyChart(chart: Chart | null): void {
    if (chart) {
      chart.destroy();
    }
  }

  async downloadPdf(): Promise<void> {
    if (!this.dashboardContainer) {
      alert('No se puede exportar: contenedor no disponible');
      return;
    }

    try {
      await this.pdfService.generateDashboardPdf(
        this.dashboardContainer.nativeElement,
        this.stats
      );
    } catch (error) {
      console.error('Error al generar PDF:', error);
      alert('No se pudo generar el PDF. Revisa la consola para más detalles.');
    }
  }

  ngOnInit(): void {
    this.loadStats();
  }

  ngAfterViewInit(): void {
    // Los gráficos se crearán en loadStats()
  }

  ngOnDestroy(): void {
    this.destroyChart(this.statusChart);
    this.destroyChart(this.trendChart);
    this.destroyChart(this.agentChart);
    this.destroyChart(this.destChart);
  }
}