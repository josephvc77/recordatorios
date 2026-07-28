import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { RequestStoreService } from '../../core/services/request-store.service';
import { ConfigService } from '../../core/services/config.service';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { StatusChipComponent } from '../../shared/components/status-chip/status-chip.component';
import { PriorityBadgeComponent } from '../../shared/components/priority-badge/priority-badge.component';
import { TagListComponent } from '../../shared/components/tag-list/tag-list.component';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { RequestFormComponent } from '../request-form/request-form.component';

@Component({
  selector: 'app-request-list',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    StatusChipComponent, 
    PriorityBadgeComponent, 
    TagListComponent,
    MatMenuModule,
    MatButtonModule,
    MatDialogModule
  ],
  template: `
    <div class="list-page">
      <!-- HEADER Y BOTÓN CREAR -->
      <div class="page-header">
        <div>
          <h1 class="page-title">Listado Principal de Solicitudes</h1>
          <p class="page-subtitle">Visualización en el orden exacto especificado con indicadores y semáforos visuales</p>
        </div>
        @if (authService.hasPermission('crear_solicitud')) {
          <button class="btn-primary" (click)="openCreateModal()">
            <span class="material-icons">add</span> Nueva Solicitud
          </button>
        }
      </div>

      <!-- BARRA MULTIFILTRO Y BÚSQUEDA -->
      <div class="filter-toolbar">
        <div class="search-box">
          <span class="material-icons search-icon">search</span>
          <input 
            type="text" 
            placeholder="Buscar por folio, solicitud, tema, IP/DP..." 
            [ngModel]="filterState().searchQuery"
            (ngModelChange)="onSearchChange($event)">
        </div>

        <div class="filter-group">
          <!-- Área -->
          <select [ngModel]="filterState().areaId" (ngModelChange)="onFilterChange('areaId', $event)">
            <option value="ALL">🏢 Todas las Áreas</option>
            @for (area of configService.config().areas; track area.id) {
              <option [value]="area.id">{{ area.nombre }}</option>
            }
          </select>

          <!-- Estatus -->
          <select [ngModel]="filterState().statusId" (ngModelChange)="onFilterChange('statusId', $event)">
            <option value="ALL">🏷️ Todos los Estatus</option>
            @for (status of configService.config().statuses; track status.id) {
              <option [value]="status.id">{{ status.nombre }}</option>
            }
          </select>

          <!-- Urgencia / Semáforo -->
          <select [ngModel]="filterState().priorityKey" (ngModelChange)="onFilterChange('priorityKey', $event)">
            <option value="ALL">🚨 Todas las Urgencias</option>
            <option value="CRÍTICO">🔴 Crítico (1 día)</option>
            <option value="URGENTE">🟠 Urgente (2 días)</option>
            <option value="Importante">🟧 Importante (3 días)</option>
            <option value="Advertencia">🟡 Próximo a vencer</option>
            <option value="Vence Hoy">🔴 Vence Hoy</option>
            <option value="Vencido">⚫ Vencidos</option>
          </select>

          <!-- Reset -->
          <button class="btn-reset" (click)="store.resetFilters()" title="Limpiar Filtros">
            <span class="material-icons">filter_alt_off</span>
          </button>
        </div>
      </div>

      <!-- TABLA PRINCIPAL DE REGISTROS CON ORDEN EXACTO DE COLUMNAS -->
      <div class="table-container">
        <table class="m3-table">
          <thead>
            <tr>
              <th>SEMÁFORO</th>
              <th>SOLICITUD</th>
              <th class="col-area-header">ÁREA TURNADA</th>
              <th>RECORDATORIO</th>
              <th>DÍAS</th>
              <th>FECHA VENCIMIENTO</th>
              <th>ESTATUS</th>
              <th class="col-tema-header">TEMA</th>
              <th>OBSERVACIONES</th>
              <th>IP / DP</th>
              <th>FOLIO</th>
              <th>FECHA ENTRADA</th>
              <th>FECHA TÉRMINO</th>
              <th class="text-right">ACCIONES</th>
            </tr>
          </thead>
          <tbody>
            @for (item of store.filteredRequests(); track item.id) {
              <tr [class.urgent-row]="item.showAlertIcon">
                <!-- 1. SEMÁFORO -->
                <td>
                  <app-priority-badge 
                    [priorityKey]="item.priorityKey || 'NORMAL'" 
                    [message]="item.priorityLabel || 'Normal'" 
                    [colorHex]="item.visualColorHex || '#6B7280'"
                    [showAlertIcon]="item.showAlertIcon || false">
                  </app-priority-badge>
                </td>

                <!-- 2. SOLICITUD -->
                <td>
                  <div class="request-main-info" (click)="viewDetail(item.id)">
                    <span class="request-title">{{ item.solicitud }}</span>
                    @if (item.tags && item.tags.length > 0) {
                      <app-tag-list [tags]="item.tags"></app-tag-list>
                    }
                  </div>
                </td>

                <!-- 3. ÁREA TURNADA -->
                <td>
                  <span class="area-tag">{{ getAreaName(item.areaId) }}</span>
                </td>

                <!-- 4. RECORDATORIO -->
                <td>
                  <span class="reminder-text" [style.color]="item.visualColorHex">
                    {{ item.badgeMessage || 'Sin alerta' }}
                  </span>
                </td>

                <!-- 5. DÍAS -->
                <td>
                  <span class="days-text" [class.negative]="(item.diasRestantes || 0) < 0">
                    {{ item.diasRestantes }}d
                  </span>
                </td>

                <!-- 6. FECHA DE VENCIMIENTO -->
                <td class="date-text font-bold">{{ item.fechaVencimiento }}</td>

                <!-- 7. ESTATUS -->
                <td>
                  <app-status-chip [statusId]="item.estatusId"></app-status-chip>
                </td>

                <!-- 8. TEMA -->
                <td class="tema-text">{{ item.tema }}</td>

                <!-- 9. OBSERVACIONES -->
                <td>
                  @if (item.observaciones) {
                    <div class="obs-cell" [title]="item.observaciones">
                      <span class="obs-dot">🔴</span>
                      <span class="obs-snippet">{{ item.observaciones }}</span>
                    </div>
                  } @else {
                    <span class="text-muted">-</span>
                  }
                </td>

                <!-- 10. IP / DP -->
                <td>
                  @if (isDatosPersonales(item.ipDp)) {
                    <span class="ip-dp-badge dp-tag" title="DATOS PERSONALES">DATOS PERSONALES</span>
                  } @else if (isAmbos(item.ipDp)) {
                    <span class="ip-dp-badge both-tag" title="INFORMACIÓN PÚBLICA Y DATOS PERSONALES">IP / DP</span>
                  } @else {
                    <span class="ip-dp-badge ip-tag" title="INFORMACIÓN PÚBLICA">INFORMACIÓN PÚBLICA</span>
                  }
                </td>

                <!-- 11. FOLIO -->
                <td class="col-folio" (click)="viewDetail(item.id)">{{ item.folio }}</td>

                <!-- 12. FECHA ENTRADA -->
                <td class="date-text">{{ item.fechaEntrada }}</td>

                <!-- 13. FECHA TÉRMINO -->
                <td class="date-text font-bold text-success">
                  {{ item.fechaTermino || '-' }}
                </td>

                <!-- 14. ACCIONES -->
                <td class="text-right">
                  <button mat-icon-button [matMenuTriggerFor]="actionMenu" class="action-btn">
                    <span class="material-icons">more_vert</span>
                  </button>

                  <mat-menu #actionMenu="matMenu">
                    <button mat-menu-item (click)="viewDetail(item.id)">
                      <span class="material-icons">visibility</span> Ver Detalle & Timeline
                    </button>

                    @if (authService.hasPermission('editar_solicitud')) {
                      <button mat-menu-item (click)="openEditModal(item)">
                        <span class="material-icons">edit</span> Editar Solicitud
                      </button>
                    }

                    @if (authService.hasPermission('cambiar_estatus')) {
                      <div class="menu-divider"></div>
                      <div class="menu-header">Cambiar Estatus</div>
                      @for (st of configService.config().statuses; track st.id) {
                        <button mat-menu-item (click)="changeStatus(item.id, st.id)">
                          <span class="status-dot" [style.background-color]="st.colorHex"></span>
                          <span>{{ st.nombre }}</span>
                        </button>
                      }
                    }

                    @if (authService.hasPermission('eliminar_solicitud')) {
                      <div class="menu-divider"></div>
                      <button mat-menu-item (click)="deleteRequest(item)" class="text-danger">
                        <span class="material-icons">delete</span> Eliminar
                      </button>
                    }
                  </mat-menu>
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="14" class="empty-table">
                  <span class="material-icons empty-icon">search_off</span>
                  <p>No se encontraron solicitudes que coincidan con los filtros aplicados.</p>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .list-page {
      padding: 24px;
    }
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
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
    .btn-primary {
      background: #3B82F6;
      color: #FFFFFF;
      border: none;
      padding: 10px 18px;
      border-radius: 10px;
      font-size: 14px;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
      transition: background 0.15s ease;
    }
    .btn-primary:hover {
      background: #2563EB;
    }
    .filter-toolbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 16px;
      background: #FFFFFF;
      padding: 16px;
      border-radius: 12px;
      margin-bottom: 20px;
      border: 1px solid #E2E8F0;
      flex-wrap: wrap;
    }
    .search-box {
      display: flex;
      align-items: center;
      gap: 8px;
      background: #F1F5F9;
      padding: 8px 14px;
      border-radius: 10px;
      flex: 1;
      min-width: 260px;
    }
    .search-icon {
      color: #94A3B8;
      font-size: 20px;
    }
    .search-box input {
      border: none;
      background: transparent;
      outline: none;
      width: 100%;
      font-size: 14px;
      color: #0F172A;
    }
    .filter-group {
      display: flex;
      gap: 12px;
      align-items: center;
      flex-wrap: wrap;
    }
    .filter-group select {
      padding: 8px 12px;
      border-radius: 8px;
      border: 1px solid #CBD5E1;
      background: #FFFFFF;
      font-size: 13px;
      color: #334155;
      outline: none;
    }
    .btn-reset {
      background: #F1F5F9;
      border: 1px solid #CBD5E1;
      padding: 8px;
      border-radius: 8px;
      cursor: pointer;
      color: #64748B;
      display: flex;
      align-items: center;
    }
    .table-container {
      background: #FFFFFF;
      border-radius: 14px;
      border: 1px solid #E2E8F0;
      overflow-x: auto;
      box-shadow: 0 2px 8px rgba(0,0,0,0.04);
    }
    .m3-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;
    }
    .m3-table th {
      background: #F8FAFC;
      color: #475569;
      font-weight: 800;
      text-align: left;
      padding: 14px 14px;
      border-bottom: 2px solid #E2E8F0;
      white-space: nowrap;
      font-size: 11px;
      letter-spacing: 0.5px;
    }
    .col-area-header {
      max-width: 130px;
      width: 130px;
    }
    .col-tema-header {
      min-width: 240px;
      max-width: 320px;
    }
    .m3-table td {
      padding: 12px 14px;
      border-bottom: 1px solid #F1F5F9;
      vertical-align: middle;
    }
    .m3-table tr:hover {
      background: #F8FAFC;
    }
    .urgent-row {
      background: #FEF2F2;
    }
    .col-folio {
      font-weight: 800;
      color: #3B82F6;
      cursor: pointer;
      white-space: nowrap;
    }
    .request-main-info {
      cursor: pointer;
      display: flex;
      flex-direction: column;
      gap: 2px;
      min-width: 180px;
    }
    .request-title {
      font-weight: 700;
      color: #0F172A;
      font-size: 13px;
    }
    .area-tag {
      font-size: 11px;
      font-weight: 700;
      color: #475569;
      background: #F1F5F9;
      padding: 4px 8px;
      border-radius: 6px;
      display: inline-block;
      max-width: 130px;
      white-space: normal;
      word-break: break-word;
      line-height: 1.25;
    }
    .reminder-text {
      font-size: 12px;
      font-weight: 700;
      white-space: nowrap;
    }
    .date-text {
      font-size: 12px;
      color: #475569;
      white-space: nowrap;
    }
    .font-bold { font-weight: 700; }
    .days-text {
      font-weight: 800;
      color: #16A34A;
    }
    .days-text.negative {
      color: #DC2626;
    }
    .tema-text {
      font-size: 12px;
      color: #475569;
      min-width: 240px;
      max-width: 320px;
      white-space: normal;
      word-wrap: break-word;
      word-break: break-word;
      line-height: 1.4;
    }
    .obs-cell {
      display: flex;
      align-items: center;
      gap: 6px;
      max-width: 200px;
    }
    .obs-dot { font-size: 10px; }
    .obs-snippet {
      font-size: 12px;
      color: #7F1D1D;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .ip-dp-badge {
      font-size: 11px;
      font-weight: 800;
      padding: 3px 8px;
      border-radius: 6px;
      white-space: nowrap;
    }
    .ip-tag {
      background: #EFF6FF;
      color: #1D4ED8;
      border: 1px solid #BFDBFE;
    }
    .dp-tag {
      background: #F3E8FF;
      color: #6B21A8;
      border: 1px solid #E9D5FF;
    }
    .both-tag {
      background: #EEF2FF;
      color: #3730A3;
      border: 1px solid #C7D2FE;
    }
    .text-muted { color: #94A3B8; }
    .text-success { color: #16A34A; }
    .empty-table {
      text-align: center;
      padding: 40px !important;
      color: #94A3B8;
    }
    .empty-icon {
      font-size: 48px;
      margin-bottom: 8px;
    }
    .status-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      display: inline-block;
      margin-right: 8px;
    }
    .text-right { text-align: right; }
    .menu-header { font-size: 10px; font-weight: 800; color: #94A3B8; padding: 6px 16px; }
    .menu-divider { height: 1px; background: #E2E8F0; margin: 4px 0; }
  `]
})
export class RequestListComponent {
  public store = inject(RequestStoreService);
  public configService = inject(ConfigService);
  public authService = inject(AuthService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);
  private dialog = inject(MatDialog);

  public filterState = this.store.filterState;

  onSearchChange(q: string) {
    this.store.updateFilters({ searchQuery: q });
  }

  onFilterChange(key: string, val: string) {
    this.store.updateFilters({ [key]: val });
  }

  getAreaName(areaId: string): string {
    if (!areaId) return 'N/A';
    const found = this.configService.getAreaById(areaId);
    return found ? found.nombre : areaId;
  }

  isDatosPersonales(val?: string): boolean {
    if (!val) return false;
    const v = val.toUpperCase();
    return v === 'DP' || v.includes('DATOS PERSONALES');
  }

  isAmbos(val?: string): boolean {
    if (!val) return false;
    const v = val.toUpperCase();
    return v.includes('/') || v.includes('AMBOS');
  }

  viewDetail(id: string) {
    this.router.navigate(['/requests', id]);
  }

  openCreateModal() {
    this.dialog.open(RequestFormComponent, {
      width: '640px',
      data: { mode: 'create' }
    });
  }

  openEditModal(item: any) {
    this.dialog.open(RequestFormComponent, {
      width: '640px',
      data: { mode: 'edit', request: item }
    });
  }

  async changeStatus(id: string, newStatusId: string) {
    const ok = await this.store.changeStatus(id, newStatusId, 'Solicitudes', 'TablaPrincipal');
    if (ok) {
      this.notificationService.showSuccess('Estatus actualizado correctamente.');
    } else {
      this.notificationService.showError('Error al actualizar estatus.');
    }
  }

  async deleteRequest(item: any) {
    if (confirm(`¿Estás seguro de eliminar la solicitud ${item.folio}?`)) {
      const ok = await this.store.deleteRequest(item.id);
      if (ok) {
        this.notificationService.showSuccess('Solicitud eliminada.');
      } else {
        this.notificationService.showError('Error al eliminar solicitud.');
      }
    }
  }
}
