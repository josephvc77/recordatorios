import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { RequestStoreService } from '../../core/services/request-store.service';
import { ConfigService } from '../../core/services/config.service';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { StatusChipComponent } from '../../shared/components/status-chip/status-chip.component';
import { PriorityBadgeComponent } from '../../shared/components/priority-badge/priority-badge.component';

@Component({
  selector: 'app-request-detail',
  standalone: true,
  imports: [CommonModule, StatusChipComponent, PriorityBadgeComponent],
  template: `
    <div class="detail-page">
      @if (request()) {
        @let req = request()!;
        <!-- TOP TOOLBAR -->
        <div class="page-top">
          <button class="btn-back" (click)="goBack()">← Volver a la Lista</button>
          <div class="top-actions">
            <app-status-chip [statusId]="req.estatusId"></app-status-chip>
            <app-priority-badge 
              [priorityKey]="req.priorityKey || ''" 
              [message]="req.badgeMessage || ''" 
              [colorHex]="req.visualColorHex || ''"
              [showAlertIcon]="req.showAlertIcon || false">
            </app-priority-badge>
          </div>
        </div>

        <div class="detail-grid">
          <!-- PANEL IZQUIERDO: INFORMACIÓN DE LA SOLICITUD & ADJUNTO DRIVE -->
          <div class="info-panel">
            <div class="card-box">
              <div class="request-header-info">
                <span class="folio-label">{{ req.folio }}</span>
                <h1 class="solicitud-title">{{ req.solicitud }}</h1>
              </div>

              <div class="fields-grid">
                <div class="field-item">
                  <span class="label">ÁREA TURNADA</span>
                  <span class="val font-bold">{{ getAreaName(req.areaId) }}</span>
                </div>
                <div class="field-item">
                  <span class="label">TEMA</span>
                  <span class="val">{{ req.tema }}</span>
                </div>
                <div class="field-item">
                  <span class="label">TIPO SOLICITUD</span>
                  <span class="val">{{ getTypeName(req.tipoId) }}</span>
                </div>
                <div class="field-item">
                  <span class="label">FECHA DE ENTRADA</span>
                  <span class="val">{{ req.fechaEntrada }}</span>
                </div>
                <div class="field-item">
                  <span class="label">FECHA VENCIMIENTO</span>
                  <span class="val font-bold text-danger">{{ req.fechaVencimiento }}</span>
                </div>
                @if (req.fechaTermino) {
                  <div class="field-item">
                    <span class="label">FECHA TÉRMINO</span>
                    <span class="val font-bold text-success">{{ req.fechaTermino }}</span>
                  </div>
                }
              </div>

              @if (req.observaciones) {
                <div class="obs-box">
                  <span class="obs-label">💬 OBSERVACIONES</span>
                  <p class="obs-text">{{ req.observaciones }}</p>
                </div>
              }
            </div>

            <!-- ADJUNTOS EN GOOGLE DRIVE -->
            <div class="card-box margin-top">
              <div class="attachments-header">
                <h3>📎 Adjuntos en Google Drive</h3>
                @if (authService.hasPermission('subir_adjuntos')) {
                  <label class="btn-upload">
                    <span class="material-icons">cloud_upload</span> Subir Archivo
                    <input type="file" (change)="onFileSelected($event)" hidden>
                  </label>
                }
              </div>

              <div class="attachments-list">
                @for (att of requestAttachments(); track att.idAdjunto) {
                  <div class="attachment-card">
                    <span class="file-icon">📄</span>
                    <div class="file-info">
                      <a [href]="att.driveUrl" target="_blank" class="file-name">{{ att.nombreArchivo }}</a>
                      <span class="file-meta">{{ att.tipoDocumento }} • {{ att.fechaSubida.substring(0, 10) }} por {{ att.usuarioSubida }}</span>
                    </div>
                    <a [href]="att.driveUrl" target="_blank" class="btn-view" title="Abrir en Google Drive">👁️ Drive</a>
                  </div>
                } @empty {
                  <div class="empty-att">No hay documentos adjuntos aún.</div>
                }
              </div>
            </div>
          </div>

          <!-- PANEL DERECHO: TIMELINE CONVERSACIONAL (FEED DE AUDITORÍA) -->
          <div class="timeline-panel">
            <div class="card-box">
              <h3 class="timeline-title">⏱️ Historial de Movimientos (Feed)</h3>

              <div class="feed-list">
                @for (entry of requestHistory(); track entry.idHistorial) {
                  <div class="feed-item">
                    <div class="feed-avatar">👤</div>
                    <div class="feed-body">
                      <div class="feed-header">
                        <span class="feed-user">{{ entry.usuario }}</span>
                        <span class="feed-time">{{ entry.fechaHora.substring(0, 16).replace('T', ' ') }}</span>
                      </div>
                      <div class="feed-action">
                        <span class="action-tag">{{ entry.tipoAccion }}</span>
                        <span class="action-desc">
                          @if (entry.campo === 'Estatus') {
                            Cambió estatus: <app-status-chip [statusId]="entry.valorAnterior"></app-status-chip> ➔ <app-status-chip [statusId]="entry.valorNuevo"></app-status-chip>
                          } @else {
                            {{ entry.valorNuevo }}
                          }
                        </span>
                      </div>
                      <div class="feed-source">Origen: {{ entry.modulo }} ({{ entry.origen }})</div>
                    </div>
                  </div>
                } @empty {
                  <div class="empty-feed">Sin actividad registrada.</div>
                }
              </div>
            </div>
          </div>
        </div>
      } @else {
        <div class="not-found">Solicitud no encontrada.</div>
      }
    </div>
  `,
  styles: [`
    .detail-page {
      padding: 24px;
    }
    .page-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }
    .btn-back {
      background: #FFFFFF;
      border: 1px solid #CBD5E1;
      padding: 8px 16px;
      border-radius: 8px;
      font-weight: 700;
      cursor: pointer;
      color: #475569;
    }
    .top-actions {
      display: flex;
      gap: 12px;
      align-items: center;
    }
    .detail-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
    }
    @media (max-width: 1024px) {
      .detail-grid {
        grid-template-columns: 1fr;
      }
    }
    .card-box {
      background: #FFFFFF;
      border-radius: 16px;
      padding: 24px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.05);
      border: 1px solid #E2E8F0;
    }
    .margin-top { margin-top: 24px; }
    .folio-label {
      font-size: 13px;
      font-weight: 900;
      color: #3B82F6;
      letter-spacing: 0.5px;
    }
    .solicitud-title {
      font-size: 20px;
      font-weight: 800;
      color: #0F172A;
      margin: 4px 0 20px 0;
    }
    .fields-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-bottom: 20px;
    }
    .field-item {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .field-item .label {
      font-size: 10px;
      font-weight: 800;
      color: #94A3B8;
    }
    .field-item .val {
      font-size: 13px;
      color: #1E293B;
    }
    .font-bold { font-weight: 700; }
    .text-danger { color: #DC2626; }
    .text-success { color: #16A34A; }
    .obs-box {
      background: #FEF2F2;
      border-left: 4px solid #EF4444;
      padding: 12px 16px;
      border-radius: 8px;
    }
    .obs-label {
      font-size: 11px;
      font-weight: 800;
      color: #991B1B;
    }
    .obs-text {
      font-size: 13px;
      color: #7F1D1D;
      margin: 4px 0 0 0;
    }
    .attachments-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }
    .attachments-header h3 {
      font-size: 16px;
      font-weight: 700;
      margin: 0;
      color: #0F172A;
    }
    .btn-upload {
      background: #10B981;
      color: #FFFFFF;
      padding: 6px 14px;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 700;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .attachments-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .attachment-card {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 14px;
      background: #F8FAFC;
      border-radius: 10px;
      border: 1px solid #E2E8F0;
    }
    .file-icon { font-size: 20px; }
    .file-info { flex: 1; display: flex; flex-direction: column; }
    .file-name { font-size: 13px; font-weight: 700; color: #2563EB; text-decoration: none; }
    .file-meta { font-size: 11px; color: #64748B; }
    .btn-view { font-size: 12px; text-decoration: none; color: #475569; background: #E2E8F0; padding: 4px 8px; border-radius: 6px; }
    .timeline-title { font-size: 16px; font-weight: 700; color: #0F172A; margin: 0 0 16px 0; }
    .feed-list { display: flex; flex-direction: column; gap: 16px; }
    .feed-item { display: flex; gap: 12px; }
    .feed-avatar { font-size: 20px; }
    .feed-body { background: #F8FAFC; border-radius: 10px; padding: 12px; border: 1px solid #E2E8F0; flex: 1; }
    .feed-header { display: flex; justify-content: space-between; margin-bottom: 4px; }
    .feed-user { font-size: 12px; font-weight: 800; color: #1E293B; }
    .feed-time { font-size: 10px; color: #94A3B8; }
    .feed-action { display: flex; align-items: center; gap: 8px; font-size: 13px; color: #334155; }
    .action-tag { font-size: 10px; font-weight: 800; background: #E2E8F0; padding: 2px 6px; border-radius: 4px; }
    .feed-source { font-size: 10px; color: #94A3B8; margin-top: 4px; }
    .empty-att, .empty-feed, .not-found { color: #94A3B8; font-size: 13px; text-align: center; padding: 20px; }
  `]
})
export class RequestDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private store = inject(RequestStoreService);
  public configService = inject(ConfigService);
  public authService = inject(AuthService);
  private notificationService = inject(NotificationService);

  public request = signal<any>(null);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      const item = this.store.evaluatedRequests().find(r => r.id === id);
      this.request.set(item || null);
    }
  }

  get requestHistory() {
    return () => {
      const id = this.request()?.id;
      if (!id) return [];
      return this.store.history().filter(h => h.idSolicitud === id);
    };
  }

  get requestAttachments() {
    return () => {
      const id = this.request()?.id;
      if (!id) return [];
      return this.store.attachments().filter(a => a.idSolicitud === id);
    };
  }

  getAreaName(areaId: string): string {
    return this.configService.getAreaById(areaId)?.nombre || areaId;
  }

  getTypeName(typeId: string): string {
    return this.configService.getTypeById(typeId)?.nombre || typeId;
  }

  goBack() {
    this.router.navigate(['/requests']);
  }

  async onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    const id = this.request()?.id;
    if (!id) return;

    this.notificationService.showInfo('Subiendo archivo a Google Drive...');
    const ok = await this.store.uploadAttachment(id, file, 'Oficio');
    if (ok) {
      this.notificationService.showSuccess('Archivo subido correctamente a Google Drive.');
    } else {
      this.notificationService.showError('Error al subir archivo a Google Drive.');
    }
  }
}
