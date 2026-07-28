import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { RequestStoreService } from '../../core/services/request-store.service';
import { ConfigService } from '../../core/services/config.service';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { PriorityBadgeComponent } from '../../shared/components/priority-badge/priority-badge.component';
import { DragDropModule, CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { RequestItem } from '../../domain/models/request.model';

@Component({
  selector: 'app-kanban',
  standalone: true,
  imports: [CommonModule, DragDropModule, PriorityBadgeComponent],
  template: `
    <div class="kanban-page">
      <div class="page-header">
        <div>
          <h1 class="page-title">Tablero Kanban</h1>
          <p class="page-subtitle">Gestión visual interactiva por columnas de estatus (Drag & Drop)</p>
        </div>
      </div>

      <!-- BOARD KANBAN -->
      <div class="kanban-board">
        @for (col of columns(); track col.statusId) {
          <div class="kanban-column">
            <div class="column-header" [style.border-top-color]="col.colorHex">
              <span class="column-title">{{ col.statusName }}</span>
              <span class="column-count">{{ col.items.length }}</span>
            </div>

            <div 
              cdkDropList
              [id]="col.statusId"
              [cdkDropListData]="col.items"
              [cdkDropListConnectedTo]="connectedDropLists"
              (cdkDropListDropped)="drop($event)"
              class="column-body">
              
              @for (item of col.items; track item.id) {
                <div cdkDrag class="kanban-card" (click)="openDetail(item.id)">
                  <div class="card-top">
                    <span class="card-folio">{{ item.folio }}</span>
                    <app-priority-badge 
                      [priorityKey]="item.priorityKey || ''" 
                      [message]="item.badgeMessage || ''" 
                      [colorHex]="item.visualColorHex || ''"
                      [showAlertIcon]="item.showAlertIcon || false">
                    </app-priority-badge>
                  </div>
                  
                  <div class="card-title">{{ item.solicitud }}</div>
                  
                  <div class="card-footer">
                    <span class="area-badge">{{ getAreaName(item.areaId) }}</span>
                    <span class="date-badge">📅 {{ item.fechaVencimiento }}</span>
                  </div>
                </div>
              } @empty {
                <div class="empty-column">Sin solicitudes</div>
              }
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .kanban-page {
      padding: 24px;
    }
    .page-header {
      margin-bottom: 20px;
    }
    .page-title {
      font-size: 24px;
      font-weight: 800;
      color: #0F172A;
      margin: 0 0 4px 0;
    }
    .page-subtitle {
      font-size: 14px;
      color: #64748B;
      margin: 0;
    }
    .kanban-board {
      display: flex;
      gap: 16px;
      overflow-x: auto;
      padding-bottom: 16px;
      align-items: flex-start;
    }
    .kanban-column {
      width: 300px;
      min-width: 300px;
      background: #F1F5F9;
      border-radius: 14px;
      border: 1px solid #E2E8F0;
      display: flex;
      flex-direction: column;
      max-height: calc(100vh - 180px);
    }
    .column-header {
      padding: 14px 16px;
      font-weight: 800;
      font-size: 14px;
      color: #1E293B;
      border-top: 4px solid #3B82F6;
      border-top-left-radius: 14px;
      border-top-right-radius: 14px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #FFFFFF;
    }
    .column-count {
      background: #E2E8F0;
      color: #475569;
      font-size: 11px;
      padding: 2px 8px;
      border-radius: 10px;
    }
    .column-body {
      padding: 12px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 12px;
      min-height: 120px;
    }
    .kanban-card {
      background: #FFFFFF;
      border-radius: 10px;
      padding: 14px;
      box-shadow: 0 2px 6px rgba(0,0,0,0.05);
      border: 1px solid #E2E8F0;
      cursor: grab;
      transition: box-shadow 0.15s ease, transform 0.15s ease;
    }
    .kanban-card:hover {
      box-shadow: 0 6px 14px rgba(0,0,0,0.1);
      transform: translateY(-2px);
    }
    .cdk-drag-preview {
      box-shadow: 0 10px 25px rgba(0,0,0,0.2) !important;
      border-radius: 10px;
    }
    .cdk-drag-placeholder {
      opacity: 0.3;
    }
    .card-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }
    .card-folio {
      font-size: 11px;
      font-weight: 800;
      color: #3B82F6;
    }
    .card-title {
      font-size: 13px;
      font-weight: 700;
      color: #0F172A;
      margin-bottom: 12px;
      line-height: 1.3;
    }
    .card-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 11px;
      color: #64748B;
    }
    .area-badge {
      background: #F1F5F9;
      padding: 2px 6px;
      border-radius: 4px;
    }
    .empty-column {
      text-align: center;
      padding: 20px;
      color: #94A3B8;
      font-size: 12px;
      border: 2px dashed #CBD5E1;
      border-radius: 10px;
    }
  `]
})
export class KanbanComponent {
  private store = inject(RequestStoreService);
  public configService = inject(ConfigService);
  public authService = inject(AuthService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);

  get columns() {
    return () => {
      const statuses = this.configService.config().statuses;
      const allRequests = this.store.evaluatedRequests();

      return statuses.map(st => ({
        statusId: st.id,
        statusName: st.nombre,
        colorHex: st.colorHex,
        items: allRequests.filter(r => r.estatusId === st.id)
      }));
    };
  }

  get connectedDropLists(): string[] {
    return this.configService.config().statuses.map(st => st.id);
  }

  getAreaName(areaId: string): string {
    return this.configService.getAreaById(areaId)?.nombre || areaId;
  }

  openDetail(id: string) {
    this.router.navigate(['/requests', id]);
  }

  async drop(event: CdkDragDrop<RequestItem[]>) {
    if (!this.authService.hasPermission('cambiar_estatus')) {
      this.notificationService.showWarning('No tienes permiso para cambiar el estatus.');
      return;
    }

    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      const item = event.previousContainer.data[event.previousIndex];
      const targetStatusId = event.container.id;

      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );

      const ok = await this.store.changeStatus(item.id, targetStatusId, 'Kanban', 'KanbanDragDrop');
      if (ok) {
        this.notificationService.showSuccess(`Solicitud movida a ${targetStatusId}`);
      } else {
        this.notificationService.showError('Fallo al actualizar en el servidor.');
      }
    }
  }
}
