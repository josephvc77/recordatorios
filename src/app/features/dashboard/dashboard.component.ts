import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { RequestStoreService } from '../../core/services/request-store.service';
import { ConfigService } from '../../core/services/config.service';
import { PriorityBadgeComponent } from '../../shared/components/priority-badge/priority-badge.component';
import { StatusChipComponent } from '../../shared/components/status-chip/status-chip.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, PriorityBadgeComponent, StatusChipComponent],
  template: `
    <div class="dashboard-page">
      <!-- HEADER CON BIENVENIDA -->
      <div class="page-header">
        <div>
          <h1 class="page-title">Dashboard Ejecutivo & Semáforo de Riesgos</h1>
          <p class="page-subtitle">Monitoreo en tiempo real del estado de solicitudes, alertas de vencimiento y distribución por áreas</p>
        </div>
        <div class="header-sync-tag">
          <span class="pulse-dot"></span>
          <span>Sincronización en vivo</span>
        </div>
      </div>

      <!-- BANNER DE RESUMEN EJECUTIVO (4 METRICAS CLAVE) -->
      <div class="kpi-grid">
        <!-- Card 1: Total -->
        <div class="kpi-card bg-slate">
          <div class="kpi-icon-box text-slate">
            <span class="material-icons">folder</span>
          </div>
          <div class="kpi-info">
            <span class="kpi-label">TOTAL SOLICITUDES</span>
            <span class="kpi-value">{{ store.metrics().total }}</span>
            <span class="kpi-subtext">Expedientes registrados</span>
          </div>
        </div>

        <!-- Card 2: Pendientes -->
        <div class="kpi-card bg-amber">
          <div class="kpi-icon-box text-amber">
            <span class="material-icons">pending_actions</span>
          </div>
          <div class="kpi-info">
            <span class="kpi-label">EN PROCESO / PENDIENTES</span>
            <span class="kpi-value">{{ store.metrics().pendientes }}</span>
            <span class="kpi-subtext">Requieren gestión o seguimiento</span>
          </div>
        </div>

        <!-- Card 3: Terminadas -->
        <div class="kpi-card bg-emerald">
          <div class="kpi-icon-box text-emerald">
            <span class="material-icons">check_circle</span>
          </div>
          <div class="kpi-info">
            <span class="kpi-label">CONCLUIDAS / ATENDIDAS</span>
            <span class="kpi-value">{{ store.metrics().terminadas }}</span>
            <span class="kpi-subtext">Finalizadas con éxito</span>
          </div>
        </div>

        <!-- Card 4: Alertas Críticas -->
        <div class="kpi-card bg-rose" [class.pulse-border]="store.metrics().criticas + store.metrics().urgentes > 0">
          <div class="kpi-icon-box text-rose">
            <span class="material-icons">warning</span>
          </div>
          <div class="kpi-info">
            <span class="kpi-label">ALERTAS DE RIESGO</span>
            <span class="kpi-value">{{ store.metrics().criticas + store.metrics().urgentes + store.metrics().vencenHoy + store.metrics().vencidas }}</span>
            <span class="kpi-subtext">Críticas, urgentes o vencidas</span>
          </div>
        </div>
      </div>

      <!-- SECCIÓN INTERMEDIA: FLUJO POR ESTATUS Y SEMÁFORO DE RIESGO -->
      <div class="grid-2col">
        
        <!-- CARD: EMBUDO / DISTRIBUCIÓN POR ESTATUS -->
        <div class="dash-card">
          <div class="card-header-bar">
            <div class="card-title">
              <span class="material-icons text-blue">bar_chart</span>
              <h3>Distribución por Estatus de Solicitudes</h3>
            </div>
          </div>

          <div class="status-pipeline">
            @for (st of configService.config().statuses; track st.id) {
              <div class="pipeline-row">
                <div class="pipeline-label">
                  <span class="status-dot" [style.background-color]="st.colorHex"></span>
                  <span class="status-name">{{ st.nombre }}</span>
                </div>

                <div class="pipeline-bar-container">
                  <div 
                    class="pipeline-bar-fill" 
                    [style.width.%]="getPercent(store.metrics().porEstatus[st.id] || 0)"
                    [style.background-color]="st.colorHex">
                  </div>
                </div>

                <div class="pipeline-count">
                  <span class="count-badge">{{ store.metrics().porEstatus[st.id] || 0 }}</span>
                </div>
              </div>
            }
          </div>
        </div>

        <!-- CARD: SEMÁFORO DE RIESGO OPERATIVO -->
        <div class="dash-card">
          <div class="card-header-bar">
            <div class="card-title">
              <span class="material-icons text-rose">speed</span>
              <h3>Semáforo de Riesgo por Días de Vencimiento</h3>
            </div>
          </div>

          <div class="risk-breakdown">
            <!-- Críticas 1d -->
            <div class="risk-item border-red">
              <div class="risk-badge bg-red-badge">🔴 Crítico (1 Día)</div>
              <div class="risk-info">
                <span class="risk-num text-red">{{ store.metrics().criticas }}</span>
                <span class="risk-desc">Llamar al área inmediatamente</span>
              </div>
            </div>

            <!-- Urgentes 2d -->
            <div class="risk-item border-orange">
              <div class="risk-badge bg-orange-badge">🟠 Urgente (2 Días)</div>
              <div class="risk-info">
                <span class="risk-num text-orange">{{ store.metrics().urgentes }}</span>
                <span class="risk-desc">Atención prioritaria recomendada</span>
              </div>
            </div>

            <!-- Vence Hoy -->
            <div class="risk-item border-rose">
              <div class="risk-badge bg-rose-badge">🔴 Vence Hoy (0 Días)</div>
              <div class="risk-info">
                <span class="risk-num text-rose">{{ store.metrics().vencenHoy }}</span>
                <span class="risk-desc">Plazo límite de entrega el día de hoy</span>
              </div>
            </div>

            <!-- Vencidas -->
            <div class="risk-item border-dark">
              <div class="risk-badge bg-dark-badge">⚫ Vencidas (&lt;0 Días)</div>
              <div class="risk-info">
                <span class="risk-num text-dark">{{ store.metrics().vencidas }}</span>
                <span class="risk-desc">Plazo excedido fuera de término</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      <!-- LISTADO DE ATENCIÓN INMEDIATA (SOLICITUDES PRIORITARIAS) -->
      <div class="dash-card mt-24">
        <div class="card-header-bar">
          <div class="card-title">
            <span class="material-icons text-red">report_problem</span>
            <h3>Solicitudes de Atención Inmediata</h3>
          </div>
          <button class="btn-text" (click)="goToRequests()">
            Ver todas las solicitudes →
          </button>
        </div>

        <div class="table-responsive">
          <table class="urgent-table">
            <thead>
              <tr>
                <th>SEMÁFORO</th>
                <th>SOLICITUD</th>
                <th>ÁREA TURNADA</th>
                <th>RECORDATORIO</th>
                <th>FECHA VENCIMIENTO</th>
                <th>ESTATUS</th>
                <th>ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              @for (item of urgentRequests(); track item.id) {
                <tr>
                  <td>
                    <app-priority-badge 
                      [priorityKey]="item.priorityKey || 'NORMAL'" 
                      [message]="item.priorityLabel || 'Normal'" 
                      [colorHex]="item.visualColorHex || '#6B7280'"
                      [showAlertIcon]="item.showAlertIcon || false">
                    </app-priority-badge>
                  </td>
                  <td class="bold-text">{{ item.solicitud }}</td>
                  <td><span class="area-chip">{{ getAreaName(item.areaId) }}</span></td>
                  <td><span class="alert-msg" [style.color]="item.visualColorHex">{{ item.badgeMessage }}</span></td>
                  <td class="date-col">{{ item.fechaVencimiento }}</td>
                  <td><app-status-chip [statusId]="item.estatusId"></app-status-chip></td>
                  <td>
                    <button class="btn-action" (click)="viewDetail(item.id)">
                      Ver Detalle
                    </button>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="7" class="clean-empty">
                    <span class="material-icons text-emerald-icon">check_circle_outline</span>
                    <p>¡Excelente! No hay solicitudes críticas ni urgentes pendientes de atención inmediata.</p>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>

    </div>
  `,
  styles: [`
    .dashboard-page {
      padding: 28px;
    }
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
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
    .header-sync-tag {
      display: flex;
      align-items: center;
      gap: 8px;
      background: #F0FDF4;
      border: 1px solid #DCFCE7;
      color: #16A34A;
      font-size: 12px;
      font-weight: 700;
      padding: 6px 14px;
      border-radius: 20px;
    }
    .pulse-dot {
      width: 8px;
      height: 8px;
      background: #16A34A;
      border-radius: 50%;
      box-shadow: 0 0 8px rgba(22, 163, 74, 0.6);
    }
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }
    .kpi-card {
      background: #FFFFFF;
      border-radius: 16px;
      border: 1px solid #E2E8F0;
      padding: 20px;
      display: flex;
      align-items: center;
      gap: 16px;
      box-shadow: 0 4px 16px rgba(15, 23, 42, 0.03);
      transition: all 0.2s ease;
    }
    .kpi-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(15, 23, 42, 0.07);
    }
    .pulse-border {
      border-color: #FCA5A5 !important;
      animation: pulseBorder 2s infinite;
    }
    @keyframes pulseBorder {
      0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); }
      70% { box-shadow: 0 0 0 8px rgba(239, 68, 68, 0); }
      100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
    }
    .kpi-icon-box {
      width: 52px;
      height: 52px;
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .kpi-icon-box .material-icons { font-size: 28px; }
    .bg-slate { background: #F8FAFC; }
    .text-slate { color: #475569; background: #F1F5F9; }
    .bg-amber { background: #FFFBEB; }
    .text-amber { color: #D97706; background: #FEF3C7; }
    .bg-emerald { background: #F0FDF4; }
    .text-emerald { color: #059669; background: #D1FAE5; }
    .bg-rose { background: #FFF1F2; }
    .text-rose { color: #E11D48; background: #FFE4E6; }

    .kpi-info {
      display: flex;
      flex-direction: column;
    }
    .kpi-label {
      font-size: 11px;
      font-weight: 800;
      color: #64748B;
      letter-spacing: 0.5px;
    }
    .kpi-value {
      font-size: 28px;
      font-weight: 800;
      color: #0F172A;
      line-height: 1.1;
      margin: 2px 0;
    }
    .kpi-subtext {
      font-size: 12px;
      color: #94A3B8;
    }
    .grid-2col {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(440px, 1fr));
      gap: 20px;
    }
    .dash-card {
      background: #FFFFFF;
      border-radius: 18px;
      border: 1px solid #E2E8F0;
      padding: 24px;
      box-shadow: 0 4px 16px rgba(15, 23, 42, 0.03);
    }
    .card-header-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }
    .card-title {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .card-title h3 {
      font-size: 16px;
      font-weight: 800;
      color: #0F172A;
      margin: 0;
    }
    .text-blue { color: #2563EB; }
    .text-red { color: #DC2626; }
    .btn-text {
      background: transparent;
      border: none;
      color: #2563EB;
      font-weight: 700;
      font-size: 13px;
      cursor: pointer;
    }
    .status-pipeline {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .pipeline-row {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .pipeline-label {
      width: 170px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .status-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
    }
    .status-name {
      font-size: 12px;
      font-weight: 700;
      color: #334155;
    }
    .pipeline-bar-container {
      flex: 1;
      height: 10px;
      background: #F1F5F9;
      border-radius: 6px;
      overflow: hidden;
    }
    .pipeline-bar-fill {
      height: 100%;
      border-radius: 6px;
      transition: width 0.4s ease;
    }
    .count-badge {
      font-size: 12px;
      font-weight: 800;
      color: #0F172A;
      background: #F1F5F9;
      padding: 2px 8px;
      border-radius: 6px;
    }
    .risk-breakdown {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 14px;
    }
    .risk-item {
      background: #F8FAFC;
      border-radius: 14px;
      padding: 14px;
      border-left: 4px solid;
    }
    .border-red { border-left-color: #DC2626; }
    .border-orange { border-left-color: #EA580C; }
    .border-rose { border-left-color: #E11D48; }
    .border-dark { border-left-color: #334155; }

    .risk-badge {
      font-size: 11px;
      font-weight: 800;
      padding: 2px 8px;
      border-radius: 6px;
      display: inline-block;
      margin-bottom: 8px;
    }
    .bg-red-badge { background: #FEE2E2; color: #991B1B; }
    .bg-orange-badge { background: #FFEDD5; color: #9A3412; }
    .bg-rose-badge { background: #FFE4E6; color: #9F1239; }
    .bg-dark-badge { background: #E2E8F0; color: #1E293B; }

    .risk-num {
      font-size: 24px;
      font-weight: 800;
      display: block;
      line-height: 1;
    }
    .text-orange { color: #EA580C; }
    .text-dark { color: #1E293B; }

    .risk-desc {
      font-size: 11px;
      color: #64748B;
      margin-top: 4px;
      display: block;
    }
    .mt-24 { margin-top: 24px; }
    .urgent-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;
    }
    .urgent-table th {
      background: #F8FAFC;
      color: #64748B;
      font-size: 11px;
      font-weight: 800;
      text-align: left;
      padding: 12px;
      border-bottom: 1px solid #E2E8F0;
    }
    .urgent-table td {
      padding: 12px;
      border-bottom: 1px solid #F1F5F9;
      vertical-align: middle;
    }
    .bold-text { font-weight: 700; color: #0F172A; }
    .area-chip {
      background: #F1F5F9;
      color: #475569;
      font-size: 11px;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: 6px;
    }
    .alert-msg {
      font-size: 12px;
      font-weight: 700;
    }
    .date-col { font-weight: 700; color: #334155; }
    .btn-action {
      background: #EFF6FF;
      color: #2563EB;
      border: 1px solid #BFDBFE;
      padding: 6px 12px;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 700;
      cursor: pointer;
    }
    .clean-empty {
      text-align: center;
      padding: 32px !important;
      color: #64748B;
    }
    .text-emerald-icon {
      font-size: 40px;
      color: #10B981;
      margin-bottom: 8px;
    }
  `]
})
export class DashboardComponent {
  public store = inject(RequestStoreService);
  public configService = inject(ConfigService);
  private router = inject(Router);

  getPercent(val: number): number {
    const total = this.store.metrics().total;
    if (total === 0) return 0;
    return Math.round((val / total) * 100);
  }

  getAreaName(areaId: string): string {
    if (!areaId) return 'N/A';
    const found = this.configService.getAreaById(areaId);
    return found ? found.nombre : areaId;
  }

  urgentRequests() {
    return this.store.evaluatedRequests().filter(r => 
      r.priorityKey === 'CRÍTICO' || 
      r.priorityKey === 'URGENTE' || 
      r.priorityKey === 'Vence Hoy' || 
      r.priorityKey === 'Vencido'
    );
  }

  viewDetail(id: string) {
    this.router.navigate(['/requests', id]);
  }

  goToRequests() {
    this.router.navigate(['/requests']);
  }
}
