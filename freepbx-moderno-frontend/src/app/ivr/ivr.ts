//src/app/ivr/ivr.ts
import { Component, OnInit, ChangeDetectorRef} from '@angular/core';
import { ApiService } from '../core/api.service';

//Estos imports son para las notificiaciones y modales
import { ToastService } from '../core/toast.service';
import { ConfirmationService } from '../core/confirmation.service';

@Component({
  selector: 'app-ivr',
  templateUrl: './ivr.html',
  styleUrls: ['./ivr.css'],
})
export class IvrComponent implements OnInit {
  ivrs: any[] = [];
  loading = false;

  constructor(
  private api: ApiService,
  private cdr: ChangeDetectorRef,
  private toast: ToastService, // Nofiticaciones
  private confirmation: ConfirmationService, //Modales
) {}

  loadIvrs() {
    this.loading = true;
    this.api.getIvrs().subscribe({
      next: (data) => {
        this.ivrs = data || [];
        this.loading = false;
        this.cdr.detectChanges();
        this.toast.success(`${this.ivrs.length} IVRs cargados correctamente`); // Notificación de éxito
      },
      error: (err) => {
        console.error('Error al cargar IVRs', err);
        this.loading = false;
        this.toast.error('Error al cargar IVRs. Por favor, intenta de nuevo.'); // Notificación de error
        // alert('Error al cargar IVRs. Revisa la consola.'); // Mensaje de alerta simple
      }
    });
  }

  ngOnInit(): void {
    this.loadIvrs();
  }
}
