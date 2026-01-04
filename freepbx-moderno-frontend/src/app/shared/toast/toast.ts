// src/app/shared/toast/toast.component.ts
// este archivo define el componente de notificaciones tipo toast
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, Toast } from '../../core/toast.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      @for (toast of toasts$ | async; track toast.id) {
        <div class="toast toast-{{ toast.type }}"
             [@slideIn]
             (click)="dismiss(toast.id)">
          <div class="toast-icon">
            <span class="material-icons-outlined">
              @switch (toast.type) {
                @case ('success') { check_circle }
                @case ('error') { error }
                @case ('warning') { warning }
                @case ('info') { info }
              }
            </span>
          </div>
          <div class="toast-message">{{ toast.message }}</div>
          <button (click)="dismiss(toast.id); $event.stopPropagation()" class="toast-close">
            <span class="material-icons-outlined">close</span>
          </button>
        </div>
      }
    </div>
  `,// Estilos CSS para el componente de toast
  styles: [`
    .toast-container {
      position: fixed;
      top: 5rem;
      right: 1.5rem;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      max-width: 400px;
      pointer-events: none;
      background-color: white;
    }

    .toast {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem 1.25rem;
      border-radius: 12px;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
      background-color: white;
      border-left: 4px solid;
      animation: slideInRight 0.3s ease-out;
      cursor: pointer;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
      pointer-events: auto;
    }

    .toast:hover {
      transform: translateX(-4px);
      box-shadow: 0 12px 32px rgba(0, 0, 0, 0.2);
    }

    .toast-success {
      border-left-color: #10b981;
      background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(52, 211, 153, 0.05));
    }

    .toast-error {
      border-left-color: #ef4444;
      background: linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(248, 113, 113, 0.05));
    }

    .toast-warning {
      border-left-color: #f59e0b;
      background: linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(251, 191, 36, 0.05));
    }

    .toast-info {
      border-left-color: #3b82f6;
      background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(96, 165, 250, 0.05));
    }

    .toast-icon {
      flex-shrink: 0;
    }

    .toast-success .toast-icon { color: #10b981; }
    .toast-error .toast-icon { color: #ef4444; }
    .toast-warning .toast-icon { color: #f59e0b; }
    .toast-info .toast-icon { color: #3b82f6; }

    .toast-message {
      flex: 1;
      font-size: 0.875rem;
      font-weight: 500;
      color: #374151;
    }

    .toast-close {
      flex-shrink: 0;
      background: none;
      border: none;
      color: #9ca3af;
      cursor: pointer;
      padding: 0;
      display: flex;
      align-items: center;
      transition: color 0.2s;
    }

    .toast-close:hover {
      color: #374151;
    }

    @keyframes slideInRight {
      from {
        opacity: 0;
        transform: translateX(100%);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }

    @media (max-width: 640px) {
      .toast-container {
        left: 1rem;
        right: 1rem;
        max-width: none;
      }
    }

    [data-theme="dark"] .toast {
      background: #1e293b;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
    }

    [data-theme="dark"] .toast:hover {
      box-shadow: 0 12px 32px rgba(0, 0, 0, 0.5);
    }

    [data-theme="dark"] .toast-message {
      color: #f1f5f9;
    }

    [data-theme="dark"] .toast-close {
      color: #64748b;
    }

    [data-theme="dark"] .toast-close:hover {
      color: #cbd5e1;
    }

    [data-theme="dark"] .toast-success {
      background: linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(52, 211, 153, 0.1));
    }

    [data-theme="dark"] .toast-error {
      background: linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(248, 113, 113, 0.1));
    }

    [data-theme="dark"] .toast-warning {
      background: linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(251, 191, 36, 0.1));
    }

    [data-theme="dark"] .toast-info {
      background: linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(96, 165, 250, 0.1));
    }
  `]
})
export class ToastComponent implements OnInit {
  toasts$!: Observable<Toast[]>;

  constructor(private toastService: ToastService) {}

  ngOnInit() {
    this.toasts$ = this.toastService.getToasts();
  }

  dismiss(id: number) {
    this.toastService.dismiss(id);
  }
}
