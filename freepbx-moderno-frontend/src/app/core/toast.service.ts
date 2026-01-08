// src/app/core/toast.service.ts

//este archivo maneja las notificaciones tipo toast en la aplicación
import { Injectable } from '@angular/core'; // Importar Injectable para servicios
import { BehaviorSubject } from 'rxjs'; // Importar BehaviorSubject para manejar el estado de las notificaciones

export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toasts$ = new BehaviorSubject<Toast[]>([]);
  private idCounter = 0;

  getToasts() {
    return this.toasts$.asObservable();
  }

  success(message: string, duration = 3000) {
    this.show({ message, type: 'success', duration });
  }

  error(message: string, duration = 4000) {
    this.show({ message, type: 'error', duration });
  }

  warning(message: string, duration = 3500) {
    this.show({ message, type: 'warning', duration });
  }

  info(message: string, duration = 3000) {
    this.show({ message, type: 'info', duration });
  }

  private show(toast: Omit<Toast, 'id'>) {
    const id = ++this.idCounter;
    const newToast: Toast = { ...toast, id };

    const currentToasts = this.toasts$.value;
    this.toasts$.next([...currentToasts, newToast]);

    if (toast.duration) {
      setTimeout(() => this.dismiss(id), toast.duration);
    }
  }

  dismiss(id: number) {
    const currentToasts = this.toasts$.value;
    this.toasts$.next(currentToasts.filter(t => t.id !== id));
  }

  clear() {
    this.toasts$.next([]);
  }
}
