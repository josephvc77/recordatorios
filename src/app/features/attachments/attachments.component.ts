import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RequestStoreService } from '../../core/services/request-store.service';

@Component({
  selector: 'app-attachments',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="attachments-page">
      <div class="page-header">
        <div>
          <h1 class="page-title">Gestor de Adjuntos en Google Drive</h1>
          <p class="page-subtitle">Administración centralizada de documentos vinculados a solicitudes</p>
        </div>
      </div>

      <div class="table-container">
        <table class="m3-table">
          <thead>
            <tr>
              <th>DOCUMENTO</th>
              <th>SOLICITUD VINCULADA</th>
              <th>TIPO DOCUMENTO</th>
              <th>TAMAÑO</th>
              <th>FECHA SUBIDA</th>
              <th>USUARIO</th>
              <th class="text-right">ACCIONES</th>
            </tr>
          </thead>
          <tbody>
            @for (att of store.attachments(); track att.idAdjunto) {
              <tr>
                <td>
                  <div class="doc-info">
                    <span class="doc-icon">📄</span>
                    <span class="doc-name">{{ att.nombreArchivo }}</span>
                  </div>
                </td>
                <td class="col-folio">{{ getSolicitudFolio(att.idSolicitud) }}</td>
                <td><span class="type-badge">{{ att.tipoDocumento }}</span></td>
                <td>{{ formatBytes(att.tamanioBytes || 0) }}</td>
                <td>{{ att.fechaSubida.substring(0, 10) }}</td>
                <td>{{ att.usuarioSubida }}</td>
                <td class="text-right">
                  <a [href]="att.driveUrl" target="_blank" class="btn-drive">
                    <span class="material-icons">open_in_new</span> Abrir en Drive
                  </a>
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="7" class="empty-table">No se han registrado archivos adjuntos en Google Drive.</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .attachments-page { padding: 24px; }
    .page-header { margin-bottom: 24px; }
    .page-title { font-size: 24px; font-weight: 800; color: #0F172A; margin: 0 0 4px 0; }
    .page-subtitle { font-size: 14px; color: #64748B; margin: 0; }
    .table-container { background: #FFFFFF; border-radius: 14px; border: 1px solid #E2E8F0; overflow-x: auto; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
    .m3-table { width: 100%; border-collapse: collapse; font-size: 13px; }
    .m3-table th { background: #F8FAFC; color: #475569; font-weight: 700; text-align: left; padding: 14px 16px; border-bottom: 2px solid #E2E8F0; }
    .m3-table td { padding: 14px 16px; border-bottom: 1px solid #F1F5F9; vertical-align: middle; }
    .doc-info { display: flex; align-items: center; gap: 8px; font-weight: 700; color: #0F172A; }
    .col-folio { font-weight: 800; color: #3B82F6; }
    .type-badge { background: #E2E8F0; color: #475569; padding: 2px 8px; border-radius: 6px; font-size: 11px; font-weight: 700; }
    .btn-drive { display: inline-flex; align-items: center; gap: 4px; color: #2563EB; font-weight: 700; text-decoration: none; font-size: 12px; background: #EFF6FF; padding: 6px 12px; border-radius: 8px; }
    .text-right { text-align: right; }
    .empty-table { text-align: center; color: #94A3B8; padding: 40px !important; }
  `]
})
export class AttachmentsComponent {
  public store = inject(RequestStoreService);

  getSolicitudFolio(idSolicitud: string): string {
    const item = this.store.evaluatedRequests().find(r => r.id === idSolicitud);
    return item ? item.folio : 'SOL-N/A';
  }

  formatBytes(bytes: number): string {
    if (bytes === 0) return '0 KB';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }
}
