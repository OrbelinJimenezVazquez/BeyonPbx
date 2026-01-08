// src/app/calls/calls.ts
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ApiService } from '../core/api.service';
import { DatePipe, CommonModule } from '@angular/common';
import { ToastService } from '../core/toast.service';
import { ConfirmationService } from '../core/confirmation.service';
import { FormsModule } from '@angular/forms'; 
import { ExportService } from '../core/export.service';

@Component({
  selector: 'app-calls',
  standalone: true,
  imports: [
    DatePipe, 
    CommonModule,
    FormsModule,
  ],
  templateUrl: './calls.html',
  styleUrls: ['./calls.css']
})
export class CallsComponent implements OnInit {
  calls: any[] = [];
  filteredCalls: any[] = [];
  loading = false;
  currentPeriod: 'today' | 'week' | 'month' | 'year' = 'month';
  searchTerm = '';
  filterStatus = '';
  filterQueue = '';

  // Paginación
  currentPage = 1;
  totalPages = 1;
  totalCalls = 0;
  pageSize = 50;

  constructor(
    private api: ApiService,
    private cdr: ChangeDetectorRef, 
    private toast: ToastService,
    private confirmation: ConfirmationService,
    private exportService: ExportService,
  ) {}

  loadCalls(page: number = 1) {
    this.loading = true;
    this.currentPage = page;

    this.api.getDetailedCalls(this.currentPeriod, page, this.pageSize).subscribe({
      next: (response) => {
        this.calls = [...(response.items || [])];
        this.totalCalls = response.total;
        this.totalPages = response.pages;
        this.loading = false;
        
        // Aplicar filtros después de cargar
        this.applyFilters();
        
        this.cdr.detectChanges();
        
        setTimeout(() => {
          this.toast.success(`${this.calls.length} llamadas cargadas correctamente`);
        }, 200);
      },
      error: (err) => {
        console.error('Error al cargar llamadas', err);
        this.loading = false;
        this.toast.error('Error al cargar llamadas. Por favor, intenta de nuevo.');
        this.cdr.detectChanges();
      }
    });
  }

  changePeriod(period: 'today' | 'week' | 'month' | 'year') {
    this.currentPeriod = period;
    this.currentPage = 1;
    this.loadCalls(1);
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.loadCalls(page);
    }
  }

  ngOnInit(): void {
    this.loadCalls(1);
  }

  viewDetails(call: any) {
    console.log('Detalles:', call);
    // TODO: Implementar modal o página de detalle
  }

  // Métodos de búsqueda y filtros
  onSearchChange() {
    this.applyFilters();
  }

  clearSearch() {
    this.searchTerm = '';
    this.applyFilters();
  }

  applyFilters() {
    console.log('Aplicando filtros...'); // DEBUG
    console.log('Total calls:', this.calls.length); // DEBUG
    console.log('Search term:', this.searchTerm); // DEBUG
    console.log('Status filter:', this.filterStatus); // DEBUG
    console.log('Queue filter:', this.filterQueue); // DEBUG

    let filtered = [...this.calls];

    // Filtro por búsqueda
    if (this.searchTerm && this.searchTerm.trim() !== '') {
      const searchLower = this.searchTerm.toLowerCase().trim();
      filtered = filtered.filter(call => {
        const numero = call.numero?.toString().toLowerCase() || '';
        const agente = call.agente?.toLowerCase() || '';
        const numeroAgente = call.numero_agente?.toString().toLowerCase() || '';
        
        return numero.includes(searchLower) || 
               agente.includes(searchLower) || 
               numeroAgente.includes(searchLower);
      });
    }

    // Filtro por estado
    if (this.filterStatus && this.filterStatus !== '') {
      filtered = filtered.filter(call => call.evento === this.filterStatus);
    }

    // Filtro por cola
    if (this.filterQueue && this.filterQueue !== '') {
      filtered = filtered.filter(call => call.cola === this.filterQueue);
    }

    this.filteredCalls = filtered;
    console.log('Filtered calls:', this.filteredCalls.length); // DEBUG
    
    // Forzar detección de cambios
    this.cdr.detectChanges();
  }

  // Métodos para estadísticas
  getAnsweredCount(): number {
    return this.filteredCalls.filter(call => call.evento === 'ANSWERED').length;
  }

  getAverageWaitTime(): number {
    if (this.filteredCalls.length === 0) return 0;
    const total = this.filteredCalls.reduce((sum, call) => sum + (call.tiempo_espera || 0), 0);
    return Math.round(total / this.filteredCalls.length);
  }

  getAverageDuration(): number {
    if (this.filteredCalls.length === 0) return 0;
    const total = this.filteredCalls.reduce((sum, call) => sum + (call.tiempo_llamada || 0), 0);
    return Math.round(total / this.filteredCalls.length);
  }

  exportToCSV() {
    if (this.filteredCalls.length === 0) {
      this.toast.error('No hay datos para exportar');
      return;
    }

    const data = this.filteredCalls.map(call => [
      call.fecha,
      call.numero,
      call.cola,
      call.agente,
      call.evento === 'ANSWERED' ? 'Contestada' : 'No contestada',
      call.tiempo_espera,
      call.tiempo_llamada
    ]);

    this.exportService.exportToCSV(
      data, 
      `llamadas_${this.currentPeriod}_${new Date().toISOString().split('T')[0]}`, 
      ['Fecha', 'Número', 'Cola', 'Agente', 'Estado', 'Espera', 'Duración']
    );
    this.toast.success('Datos exportados a CSV correctamente');
  }

  exportToExcel() {
    if (this.filteredCalls.length === 0) {
      this.toast.error('No hay datos para exportar');
      return;
    }

    const data = this.filteredCalls.map(call => [
      call.fecha,
      call.numero,
      call.cola,
      call.agente,
      call.evento,
      call.tiempo_espera,
      call.tiempo_llamada
    ]);

    this.exportService.exportToExcel(
      data, 
      `llamadas_${this.currentPeriod}_${new Date().toISOString().split('T')[0]}`, 
      ['Fecha', 'Número', 'Cola', 'Agente', 'Estado', 'Espera', 'Duración']
    );
    this.toast.success('Datos exportados a Excel correctamente');
  }
}