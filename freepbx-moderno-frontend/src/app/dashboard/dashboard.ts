import { Component, OnInit } from '@angular/core';
import { ApiService } from '../core/api.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class DashboardComponent implements OnInit {
  stats: any = {};
  loading = false;

  constructor(private api: ApiService) {}

  loadStats() {
    this.loading = true;
    this.api.getDashboardStats().subscribe({
      next: (data) => {
        this.stats = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error:', err);
        this.loading = false;
      }
    });
  }

  ngOnInit(): void {
    this.loadStats();
  }
}