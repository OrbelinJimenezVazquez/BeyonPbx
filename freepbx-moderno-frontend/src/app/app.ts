// src/app/app.ts
import { Component } from '@angular/core';
import { PdfService } from './core/pdf.service'; // Importa el servicio PDF
import { ApiService } from './core/api.service'; //Importas el servicio API
import { DatePipe } from '@angular/common'; // Importar  el DatePipe 
import { LayoutComponent } from './layout/layout';

@Component({
  selector: 'app-root',
  standalone: true,
  providers: [PdfService, ApiService, DatePipe], 
  imports: [LayoutComponent],
  template: `<app-layout></app-layout>
  `,
  styleUrl: './app.css',

})
export class App {
  toggleDarkMode() {
    document.documentElement.classList.toggle('dark');
  }
}