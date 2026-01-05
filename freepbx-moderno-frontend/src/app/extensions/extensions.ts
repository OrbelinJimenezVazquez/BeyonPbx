// src/app/extensions/extensions.component.ts
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ApiService } from '../core/api.service';

//Estos imports son para las notificiaciones y modales
import { ToastService } from '../core/toast.service';
import { ConfirmationService } from '../core/confirmation.service';

@Component({
  selector: 'app-extensions',
  standalone: true,
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
) {}

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
}
