// src/app/extensions/extensions.component.ts
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ApiService } from '../core/api.service';

//Estos imports son para las notificiaciones y modales
import { ToastService } from '../core/toast.service';
import { ConfirmationService } from '../core/confirmation.service';
import { ExportService } from '../core/export.service'; // Importar el servicio de exportación

@Component({
  selector: 'app-extensions',
  standalone: true,
  templateUrl: './extensions.html',
  styleUrls: ['./extensions.css']
})
export class ExtensionsComponent implements OnInit {
  extensions: any[] = [];
  loading = false;
  onlineCount = 0;
  offlineCount = 0;

  // ✅ Paginación
  currentPage = 1;
  itemsPerPage = 32; // 3 páginas para 94 extensiones

  loadExtensions() {
    this.api.getExtensions().subscribe({
      next: (data) => {
        console.log('Datos recibidos:', data);
        this.extensions = data || [];
        this.loading = false;
        
        // ✅ Calcular online/offline
        this.onlineCount = this.extensions.filter(e => e.status === 'online').length;
        this.offlineCount = this.extensions.length - this.onlineCount;
      },
      error: (err) => {
        console.error('Error en API:', err);
        this.loading = false;
        alert('No se pudieron cargar las extensiones. Revisa la consola.');
      }
    });
  }

  constructor(
    private api: ApiService,
    private cdr: ChangeDetectorRef,
    private toast: ToastService,
    private confirmation: ConfirmationService,
    private exportService: ExportService 
  ) {}

  showExportMenu = false;
  ngOnInit(): void { // Cargar extensiones al iniciar el componente
    this.loadExtensions();
    this.toast.success(`${this.extensions.length} extensiones cargadas correctamente`); // Notificación de éxito
  }

  
  exportExtensions() {
    if (this.extensions.length === 0) {
      alert('No hay extensiones para exportar');
      return;
    }

    const headers = ['Extensión', 'Nombre', 'Estado'];
    const data = this.extensions.map(ext => [
      ext.extension,
      ext.name || 'Sin nombre',
      ext.status === 'online' ? 'En línea' : 'Fuera de línea'
    ]);

    this.exportService.exportToCSV(
      data,
      `extensiones_${new Date().toISOString().split('T')[0]}`,
      headers
    );
  }

  exportExtensionsJSON() {
    if (this.extensions.length === 0) {
      alert('No hay extensiones para exportar');
      return;
    }

    this.exportService.exportToJSON(
      this.extensions,
      `extensiones_${new Date().toISOString().split('T')[0]}`
    );
  }

  // ✅ Paginación
  get paginatedExtensions() {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.extensions.slice(start, end);
  }

  get startIndex() {
    return (this.currentPage - 1) * this.itemsPerPage;
  }

  get endIndex() {
    return Math.min(this.startIndex + this.itemsPerPage, this.extensions.length);
  }

  // ✅ Navegación
  previousPage() {
    if (this.currentPage > 1) this.currentPage--;
  }

  nextPage() {
    if (this.currentPage < 3) this.currentPage++; // ✅ Solo 3 páginas
  }

  goToPage(page: number) {
    this.currentPage = page;
  }
}