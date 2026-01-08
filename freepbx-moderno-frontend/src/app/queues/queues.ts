// src/app/queues/queues.ts
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../core/api.service';
import { ToastService } from '../core/toast.service';
import { ConfirmationService } from '../core/confirmation.service';

interface Queue {
  device: string;
  queue: string;
}

@Component({
  selector: 'app-queues',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './queues.html',
  styleUrls: ['./queues.css']
})
export class QueuesComponent implements OnInit {
  queues: Queue[] = [];
  filteredQueues: Queue[] = [];
  loading = false;
  searchTerm = '';
  
  // Modal de edición/creación
  showModal = false;
  modalTitle = '';
  editingQueue: Queue | null = null;
  formQueue: Queue = {
    device: '',
    queue: ''
  };

  constructor(
    private api: ApiService,
    private toast: ToastService,
    private confirmation: ConfirmationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadQueues();
  }

  /**
   * Carga todas las colas
   */
  loadQueues(): void {
    this.loading = true;
    console.log('🔄 Iniciando carga de colas...');
    
    this.api.getQueues().subscribe({
      next: (data: any) => {
        console.log('✅ Datos recibidos del backend:', data);
        console.log('✅ Tipo de datos:', typeof data, 'Es array?', Array.isArray(data));
        
        // Manejar diferentes formatos de respuesta
        if (data && Array.isArray(data.queues)) {
          this.queues = data.queues;
          console.log('📋 Colas procesadas (objeto con queues):', this.queues.length);
        } else if (data && Array.isArray(data)) {
          // Por si el backend devuelve directamente el array
          this.queues = data;
          console.log('📋 Colas procesadas (array directo):', this.queues.length);
        } else {
          console.warn('⚠️ Formato de respuesta no esperado:', data);
          this.queues = [];
        }
        
        // IMPORTANTE: Crear una copia nueva del array para forzar detección de cambios
        this.filteredQueues = JSON.parse(JSON.stringify(this.queues));
        
        console.log('🔍 filteredQueues tiene', this.filteredQueues.length, 'elementos');
        console.log('🔍 Primer elemento:', this.filteredQueues[0]);
        
        this.loading = false;
        
        // Forzar múltiples ciclos de detección de cambios
        setTimeout(() => {
          this.cdr.markForCheck();
          this.cdr.detectChanges();
        }, 0);
        
        if (this.queues.length > 0) {
          this.toast.success(`${this.queues.length} colas cargadas correctamente`);
        } else {
          this.toast.info('No hay colas registradas en el sistema');
        }
      },
      error: (err) => {
        console.error('❌ Error cargando colas:', err);
        console.error('Detalles del error:', {
          status: err.status,
          statusText: err.statusText,
          message: err.message,
          error: err.error
        });
        
        this.toast.error('Error al cargar colas. Revisa la consola para más detalles.');
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  /**
   * Filtra colas por término de búsqueda
   */
  filterQueues(): void {
    if (!this.searchTerm.trim()) {
      this.filteredQueues = [...this.queues];
      return;
    }

    const term = this.searchTerm.toLowerCase();
    this.filteredQueues = this.queues.filter(q =>
      q.queue.toLowerCase().includes(term) ||
      q.device.toString().includes(term)
    );
    
    console.log(`🔍 Búsqueda: "${term}" - Resultados: ${this.filteredQueues.length}`);
  }

  /**
   * Abre modal para crear nueva cola
   */
  openCreateModal(): void {
    this.modalTitle = 'Crear Nueva Cola';
    this.editingQueue = null;
    this.formQueue = {
      device: '',
      queue: ''
    };
    this.showModal = true;
  }

  /**
   * Abre modal para editar cola existente
   */
  openEditModal(queue: Queue): void {
    console.log('✏️ Editando cola:', queue);
    this.modalTitle = 'Editar Cola';
    this.editingQueue = queue;
    this.formQueue = { ...queue };
    this.showModal = true;
  }

  /**
   * Cierra el modal
   */
  closeModal(): void {
    this.showModal = false;
    this.editingQueue = null;
    this.formQueue = {
      device: '',
      queue: ''
    };
  }

  /**
   * Guarda la cola (crear o actualizar)
   */
  saveQueue(): void {
    if (!this.formQueue.queue.trim()) {
      this.toast.error('El nombre de la cola es requerido');
      return;
    }

    console.log('💾 Guardando cola:', this.formQueue);

    if (this.editingQueue) {
      this.updateQueue();
    } else {
      this.createQueue();
    }
  }

  /**
   * Crea una nueva cola
   */
  private createQueue(): void {
    console.log('➕ Creando nueva cola:', this.formQueue);
    
    this.api.createQueue(this.formQueue).subscribe({
      next: (response) => {
        console.log('✅ Cola creada:', response);
        this.toast.success('Cola creada exitosamente');
        this.loadQueues();
        this.closeModal();
      },
      error: (err) => {
        console.error('❌ Error creando cola:', err);
        const errorMsg = err.error?.detail || 'Error al crear la cola';
        this.toast.error(errorMsg);
      }
    });
  }

  /**
   * Actualiza una cola existente
   */
  private updateQueue(): void {
    if (!this.editingQueue?.device) {
      console.error('❌ No hay cola para actualizar');
      return;
    }

    console.log('🔄 Actualizando cola:', this.editingQueue.device, this.formQueue);

    this.api.updateQueue(this.editingQueue.device, this.formQueue).subscribe({
      next: (response) => {
        console.log('✅ Cola actualizada:', response);
        this.toast.success('Cola actualizada exitosamente');
        this.loadQueues();
        this.closeModal();
      },
      error: (err) => {
        console.error('❌ Error actualizando cola:', err);
        const errorMsg = err.error?.detail || 'Error al actualizar la cola';
        this.toast.error(errorMsg);
      }
    });
  }

  /**
   * Elimina una cola
   */
  async deleteQueue(queue: Queue): Promise<void> {
    console.log('🗑️ Intentando eliminar cola:', queue);
    
    const confirmed = await this.confirmation.confirm({
      title: '¿Estás seguro?',
      message: `¿Deseas eliminar la cola "${queue.queue}"?`,
      type: 'danger',
      confirmText: 'Eliminar',
      cancelText: 'Cancelar'
    });

    if (confirmed && queue.device) {
      console.log('✔️ Confirmado - Eliminando cola:', queue.device);
      
      this.api.deleteQueue(queue.device).subscribe({
        next: (response) => {
          console.log('✅ Cola eliminada:', response);
          this.toast.success('Cola eliminada exitosamente');
          this.loadQueues();
        },
        error: (err) => {
          console.error('❌ Error eliminando cola:', err);
          const errorMsg = err.error?.detail || 'Error al eliminar la cola';
          this.toast.error(errorMsg);
        }
      });
    } else {
      console.log('❌ Eliminación cancelada');
    }
  }
}