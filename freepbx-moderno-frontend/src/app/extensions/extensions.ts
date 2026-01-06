// src/app/extensions/extensions.component.ts
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ApiService } from '../core/api.service';
import { FormsModule } from '@angular/forms';


//Estos imports son para las notificiaciones y modales
import { ToastService } from '../core/toast.service';
import { ConfirmationService } from '../core/confirmation.service';
import { ExportService } from '../core/export.service'; // Importar el servicio de exportación

@Component({
  selector: 'app-extensions',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './extensions.html',
  styleUrls: ['./extensions.css']
})
export class ExtensionsComponent implements OnInit {
  extensions: any[] = [];
  loading = false;
  onlineCount: any;
  offlineCount: any;

  loadExtensions() {
  this.api.getExtensions().subscribe({
    next: (data) => {
      console.log('Datos recibidos:', data);
      this.extensions = data || [];
      this.loading = false;
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
    this.api.getExtensions().subscribe({ // Usar el servicio API para obtener extensiones
      next: (data) => {
        this.loadExtensions();
        console.log('Extensiones recibidas:', data);
        this.extensions = data;
        this.loading = false;
        this.cdr.detectChanges();
        this.toast.success(`${this.extensions.length} extensiones cargadas correctamente`); // Notificación de éxito
      },
      error: (err) => {
        console.error('Error al cargar extensiones', err);
        this.loading = false;
        this.toast.error('Error al cargar extensiones. Por favor, intenta de nuevo.'); // Notificación de error
      }
    });
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
}
