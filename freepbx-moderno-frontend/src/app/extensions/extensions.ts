// src/app/extensions/extensions.component.ts
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../core/api.service';

//Estos imports son para las notificiaciones y modales
import { ToastService } from '../core/toast.service';
import { ConfirmationService } from '../core/confirmation.service';
import { ExportService } from '../core/export.service';

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
  onlineCount = 0;
  offlineCount = 0;

  // ✅ Paginación
  currentPage = 1;
  itemsPerPage = 32; // 94 / 32 ≈ 3 páginas

  // ✅ Selección masiva
  allSelected = false;

  constructor(
    private api: ApiService,
    private cdr: ChangeDetectorRef,
    private toast: ToastService,
    private confirmation: ConfirmationService,
    private exportService: ExportService 
  ) {}

  ngOnInit(): void {
    this.loadExtensions();
  }

  loadExtensions() {
    this.loading = true;
    this.api.getExtensions().subscribe({
      next: (data) => {
        this.extensions = (data || []).map(ext => ({
          ...ext,
          // ✅ Asegurar que existan propiedades (ajusta según tu API)
          cw: ext.cw || false,
          dnd: ext.dnd || false,
          fmfm: ext.fmfm || false,
          cf: ext.cf || false,
          cfb: ext.cfb || false,
          cfu: ext.cfu || false,
          type: ext.type || 'SIP',
          selected: false
        }));
        this.onlineCount = this.extensions.filter(e => e.status === 'online').length;
        this.offlineCount = this.extensions.length - this.onlineCount;
        this.loading = false;
        this.toast.success(`${this.extensions.length} extensiones cargadas correctamente`);
      },
      error: (err) => {
        console.error('Error en API:', err);
        this.loading = false;
        this.toast.error('Error al cargar extensiones. Por favor, intenta de nuevo.');
      }
    });
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

  // ✅ Selección masiva (solo en la página actual)
  toggleAllSelection(event: any) {
    const checked = event.target.checked;
    this.paginatedExtensions.forEach(ext => ext.selected = checked);
    this.updateAllSelected();
  }

  updateAllSelected() {
    this.allSelected = this.paginatedExtensions.every(ext => ext.selected);
  }

  // ✅ Navegación
  previousPage() {
    if (this.currentPage > 1) this.currentPage--;
  }

  nextPage() {
    if (this.currentPage < 3) this.currentPage++;
  }

  goToPage(page: number) {
    this.currentPage = page;
  }

  // ✅ Exportación
  exportExtensions() {
    if (this.extensions.length === 0) {
      this.toast.warning('No hay extensiones para exportar');
      return;
    }

    const headers = ['Extensión', 'Nombre', 'Estado', 'CW', 'DND', 'FM/FM', 'CF', 'CFB', 'CFU'];
    const data = this.extensions.map(ext => [
      ext.extension,
      ext.name || 'Sin nombre',
      ext.status === 'online' ? 'En línea' : 'Fuera de línea',
      ext.cw ? 'Sí' : 'No',
      ext.dnd ? 'Sí' : 'No',
      ext.fmfm ? 'Sí' : 'No',
      ext.cf ? 'Sí' : 'No',
      ext.cfb ? 'Sí' : 'No',
      ext.cfu ? 'Sí' : 'No'
    ]);

    this.exportService.exportToCSV(
      data,
      `extensiones_${new Date().toISOString().split('T')[0]}`,
      headers
    );
  }

  exportExtensionsJSON() {
    if (this.extensions.length === 0) {
      this.toast.warning('No hay extensiones para exportar');
      return;
    }
    this.exportService.exportToJSON(
      this.extensions,
      `extensiones_${new Date().toISOString().split('T')[0]}`
    );
  }
}