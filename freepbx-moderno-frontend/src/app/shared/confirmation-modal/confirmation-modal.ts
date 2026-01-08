// src/app/shared/confirmation-modal/confirmation-modal.component.ts
import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfirmationService, ConfirmationConfig } from '../../core/confirmation.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-confirmation-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (showModal$ | async) {
      <div class="modal-overlay" (click)="cancel()">
        <div class="modal-content scale-in" (click)="$event.stopPropagation()">
          @if (config$ | async; as config) {
            <div class="modal-header" [class.danger]="config.type === 'danger'"
                                       [class.warning]="config.type === 'warning'">
              <div class="modal-icon">
                <span class="material-icons-outlined">
                  @switch (config.type) {
                    @case ('danger') { dangerous }
                    @case ('warning') { warning }
                    @default { help_outline }
                  }
                </span>
              </div>
              <h2 class="modal-title">{{ config.title }}</h2>
            </div>

            <div class="modal-body">
              <p>{{ config.message }}</p>
            </div>

            <div class="modal-footer">
              <button (click)="cancel()" class="btn-cancel">
                {{ config.cancelText }}
              </button>
              <button (click)="confirm()"
                      class="btn-confirm"
                      [class.danger]="config.type === 'danger'"
                      [class.warning]="config.type === 'warning'"
                      autofocus>
                {{ config.confirmText }}
              </button>
            </div>
          }
        </div>
      </div>
    }
  `,
  styles: [`
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.6);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      animation: fadeIn 0.2s ease;
    }

    .modal-content {
      background: white;
      border-radius: 20px;
      width: 90%;
      max-width: 480px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      overflow: hidden;
    }

    .modal-header {
      padding: 2rem 1.5rem 1.5rem;
      text-align: center;
      background: linear-gradient(135deg, rgba(59, 130, 246, 0.08), rgba(96, 165, 250, 0.08));
      border-bottom: 1px solid #e5e7eb;
    }

    .modal-header.danger {
      background: linear-gradient(135deg, rgba(239, 68, 68, 0.08), rgba(248, 113, 113, 0.08));
    }

    .modal-header.warning {
      background: linear-gradient(135deg, rgba(245, 158, 11, 0.08), rgba(251, 191, 36, 0.08));
    }

    .modal-icon {
      margin: 0 auto 1.25rem;
      width: 4.5rem;
      height: 4.5rem;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #3b82f6, #60a5fa);
      color: white;
      box-shadow: 0 8px 24px rgba(59, 130, 246, 0.3);
    }

    .modal-icon .material-icons-outlined {
      font-size: 2.25rem;
    }

    .modal-header.danger .modal-icon {
      background: linear-gradient(135deg, #ef4444, #f87171);
      box-shadow: 0 8px 24px rgba(239, 68, 68, 0.3);
    }

    .modal-header.warning .modal-icon {
      background: linear-gradient(135deg, #f59e0b, #fbbf24);
      box-shadow: 0 8px 24px rgba(245, 158, 11, 0.3);
    }

    .modal-title {
      margin: 0;
      font-size: 1.5rem;
      font-weight: 700;
      color: #1f2937;
    }

    .modal-body {
      padding: 1.75rem 1.5rem;
      text-align: center;
    }

    .modal-body p {
      margin: 0;
      font-size: 1rem;
      color: #6b7280;
      line-height: 1.6;
    }

    .modal-footer {
      padding: 1.25rem 1.5rem;
      display: flex;
      gap: 0.75rem;
      border-top: 1px solid #e5e7eb;
      background: #f9fafb;
    }

    .btn-cancel,
    .btn-confirm {
      flex: 1;
      padding: 0.875rem 1.5rem;
      border-radius: 12px;
      font-weight: 600;
      font-size: 0.9375rem;
      cursor: pointer;
      transition: all 0.3s ease;
      border: none;
    }

    .btn-cancel {
      background: white;
      color: #6b7280;
      border: 2px solid #e5e7eb;
    }

    .btn-cancel:hover {
      background: #f3f4f6;
      color: #374151;
      border-color: #d1d5db;
    }

    .btn-confirm {
      background: linear-gradient(135deg, #3b82f6, #60a5fa);
      color: white;
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.25);
    }

    .btn-confirm:hover {
      box-shadow: 0 6px 20px rgba(59, 130, 246, 0.35);
      transform: translateY(-1px);
    }

    .btn-confirm:active {
      transform: translateY(0);
    }

    .btn-confirm.danger {
      background: linear-gradient(135deg, #ef4444, #f87171);
      box-shadow: 0 4px 12px rgba(239, 68, 68, 0.25);
    }

    .btn-confirm.danger:hover {
      box-shadow: 0 6px 20px rgba(239, 68, 68, 0.35);
    }

    .btn-confirm.warning {
      background: linear-gradient(135deg, #f59e0b, #fbbf24);
      box-shadow: 0 4px 12px rgba(245, 158, 11, 0.25);
      color: #1f2937;
    }

    .btn-confirm.warning:hover {
      box-shadow: 0 6px 20px rgba(245, 158, 11, 0.35);
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes scaleIn {
      from {
        opacity: 0;
        transform: scale(0.9);
      }
      to {
        opacity: 1;
        transform: scale(1);
      }
    }

    .scale-in {
      animation: scaleIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    /* Dark mode */
    [data-theme="dark"] .modal-content {
      background: #1e293b;
    }

    [data-theme="dark"] .modal-header {
      border-bottom-color: #334155;
    }

    [data-theme="dark"] .modal-title {
      color: #f1f5f9;
    }

    [data-theme="dark"] .modal-body p {
      color: #cbd5e1;
    }

    [data-theme="dark"] .modal-footer {
      border-top-color: #334155;
      background: #0f172a;
    }

    [data-theme="dark"] .btn-cancel {
      background: #334155;
      color: #cbd5e1;
      border-color: #475569;
    }

    [data-theme="dark"] .btn-cancel:hover {
      background: #475569;
      border-color: #64748b;
    }
  `]
})
export class ConfirmationModalComponent implements OnInit {
  showModal$!: Observable<boolean>;
  config$!: Observable<ConfirmationConfig | null>;

  constructor(private confirmationService: ConfirmationService) {}

  ngOnInit() {
    this.showModal$ = this.confirmationService.getShowModal();
    this.config$ = this.confirmationService.getConfig();
  }

  confirm() {
    this.confirmationService.handleConfirm();
  }

  cancel() {
    this.confirmationService.handleCancel();
  }

  @HostListener('document:keydown.escape')
  onEscape() {
    this.cancel();
  }

  @HostListener('document:keydown.enter')
  onEnter() {
    this.confirm();
  }
}
