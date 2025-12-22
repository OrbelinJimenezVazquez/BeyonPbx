import { Component, OnInit } from '@angular/core';
import { ApiService } from '../core/api.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-calls',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './calls.html',
  styleUrls: ['./calls.css']
})
export class CallsComponent implements OnInit {
  calls: any[] = [];
  loading = false;
  viewMode: 'recent' | 'filtered' = 'filtered'; // ahora por defecto: filtrado (últimos 30 días)
  currentPeriod: 'today' | 'week' | 'month' | 'year' = 'month';
  
  // Paginación
  currentPage = 1;
  totalPages = 1;
  totalCalls = 0;
  pageSize = 50;

  constructor(private api: ApiService) {}

  // Cargar llamadas con paginación
  loadCalls(page: number = 1) {
    this.loading = true;
    this.currentPage = page;
    
    this.api.getCallsByPeriod(this.currentPeriod, page, this.pageSize).subscribe({
      next: (response) => {
        this.calls = response.items || [];
        this.totalCalls = response.total;
        this.totalPages = response.pages;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error:', err);
        this.loading = false;
      }
    });
  }

  // Cambiar período
  changePeriod(period: 'today' | 'week' | 'month' | 'year') {
    this.currentPeriod = period;
    this.currentPage = 1;
    this.loadCalls(1);
  }

  ngOnInit(): void {
    this.loadCalls(1); // carga inicial: últimos 30 días, página 1
  }
}