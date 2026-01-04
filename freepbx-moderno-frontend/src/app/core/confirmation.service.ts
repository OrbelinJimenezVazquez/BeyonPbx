// src/app/core/confirmation.service.ts
//este archivo maneja los modales de confirmación en la aplicación
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { take } from 'rxjs/operators';

export interface ConfirmationConfig {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
}

@Injectable({
  providedIn: 'root'
})
export class ConfirmationService {
  private showModal$ = new BehaviorSubject<boolean>(false);
  private config$ = new BehaviorSubject<ConfirmationConfig | null>(null);
  private result$ = new BehaviorSubject<boolean | null>(null);

  getShowModal() {
    return this.showModal$.asObservable();
  }

  getConfig() {
    return this.config$.asObservable();
  }

  async confirm(config: ConfirmationConfig): Promise<boolean> {
    this.config$.next({
      confirmText: 'Confirmar',
      cancelText: 'Cancelar',
      type: 'info',
      ...config
    });
    this.showModal$.next(true);

    return new Promise((resolve) => {
      this.result$.pipe(take(1)).subscribe(result => {
        this.showModal$.next(false);
        resolve(result === true);
      });
    });
  }

  handleConfirm() {
    this.result$.next(true);
  }

  handleCancel() {
    this.result$.next(false);
  }
}
