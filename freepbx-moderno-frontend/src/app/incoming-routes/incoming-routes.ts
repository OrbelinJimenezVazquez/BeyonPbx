//src/app/incoming-routes/incoming-routes.ts
import { Component, OnInit, ChangeDetectorRef} from '@angular/core';
import { ApiService } from '../core/api.service';
import { RouteDetailComponent } from '../route-detail/route-detail';

//Estos imports son para las notificiaciones y modales
import { ToastService } from '../core/toast.service';
import { ConfirmationService, ConfirmationConfig } from '../core/confirmation.service';

@Component({
  selector: 'app-incoming-routes',
  templateUrl: './incoming-routes.html',
  styleUrls: ['./incoming-routes.css'],
  imports: [RouteDetailComponent]
})
export class IncomingRoutesComponent implements OnInit {
  routes: any[] = [];
  loading = false;

  // Para el modal
  selectedRouteNumber: string = '';
  showDetailModal = false;

  constructor(
  private api: ApiService,
  private cdr: ChangeDetectorRef,
  private toast: ToastService, // Notificaciones
  private confirmationService: ConfirmationService, //Modales
) {}

  loadRoutes() {
    this.loading = true;
    this.api.getIncomingRoutes().subscribe({
      next: (data) => {
        this.routes = data || [];
        this.loading = false;
        this.cdr.detectChanges();
        this.toast.success(`${this.routes.length} rutas entrantes cargadas correctamente`); // Notificación de éxito
      },
      error: (err) => {
        console.error('Error al cargar rutas entrantes', err);
        this.loading = false;
        this.toast.error('Error al cargar rutas entrantes. Por favor, intenta de nuevo.'); // Notificación de error
        // alert('Error al cargar rutas entrantes. Revisa la consola.'); // Mensaje de alerta simple
      }
    });
  }

  viewDetails(route: any) {
    this.selectedRouteNumber = route.numero;
    this.showDetailModal = true;
  }

  closeModal() {
    this.showDetailModal = false;
    this.selectedRouteNumber = '';
  }

  ngOnInit(): void {
    this.loadRoutes();
  }
}
