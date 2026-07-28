import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RequestStoreService } from '../../core/services/request-store.service';
import { ConfigService } from '../../core/services/config.service';
import { NotificationService } from '../../core/services/notification.service';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="reports-page">
      <div class="page-header">
        <div>
          <h1 class="page-title">Reportes y Analítica Ejecutiva</h1>
          <p class="page-subtitle">Generación de informes consoldiados, tiempos de respuesta y exportación oficial</p>
        </div>
      </div>

      <div class="reports-grid">
        <!-- PANEL DE EXPORTACIÓN -->
        <div class="report-card">
          <h3>📄 Exportación de Informes Ejecutivos</h3>
          <p class="desc">Descargue el informe en formato PDF para presentación directiva o descargue los datos consolidados en Excel.</p>

          <div class="btn-group">
            <button class="btn-pdf" (click)="exportPDF()">
              <span class="material-icons">picture_as_pdf</span> Descargar Reporte PDF
            </button>
            <button class="btn-excel" (click)="exportExcel()">
              <span class="material-icons">table_view</span> Exportar Datos a Excel (.xlsx)
            </button>
          </div>
        </div>

        <!-- PROGRAMACIÓN DE REPORTES ENVIADOS -->
        <div class="report-card">
          <h3>✉️ Programación de Envíos Semanales</h3>
          <p class="desc">Active el envío automático del reporte en PDF al correo de los administradores todos los lunes a las 08:00 AM.</p>
          <label class="toggle-label">
            <input type="checkbox" checked> Enviar reporte automático por correo cada semana (GAS Hook)
          </label>
        </div>
      </div>

      <!-- RESUMEN DE RENDIMIENTO -->
      <div class="metrics-summary card-box margin-top">
        <h3>📊 Resumen Consolidado de Rendimiento</h3>
        <div class="summary-grid">
          <div class="sum-item">
            <span class="sum-num">{{ store.metrics().total }}</span>
            <span class="sum-label">Solicitudes Totales</span>
          </div>
          <div class="sum-item">
            <span class="sum-num text-success">{{ store.metrics().terminadas }}</span>
            <span class="sum-label">Solicitudes Concluidas</span>
          </div>
          <div class="sum-item">
            <span class="sum-num text-warning">{{ store.metrics().pendientes }}</span>
            <span class="sum-label">Pendientes Activas</span>
          </div>
          <div class="sum-item">
            <span class="sum-num text-danger">{{ store.metrics().criticas + store.metrics().vencidas }}</span>
            <span class="sum-label">Críticas / Vencidas</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .reports-page { padding: 24px; }
    .page-header { margin-bottom: 24px; }
    .page-title { font-size: 24px; font-weight: 800; color: #0F172A; margin: 0 0 4px 0; }
    .page-subtitle { font-size: 14px; color: #64748B; margin: 0; }
    .reports-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
    @media (max-width: 1024px) { .reports-grid { grid-template-columns: 1fr; } }
    .report-card { background: #FFFFFF; border-radius: 16px; padding: 24px; border: 1px solid #E2E8F0; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
    .report-card h3 { font-size: 16px; font-weight: 700; color: #0F172A; margin: 0 0 8px 0; }
    .desc { font-size: 13px; color: #64748B; margin-bottom: 20px; }
    .btn-group { display: flex; gap: 12px; flex-wrap: wrap; }
    .btn-pdf { background: #DC2626; color: #FFFFFF; border: none; padding: 12px 20px; border-radius: 10px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 8px; }
    .btn-excel { background: #16A34A; color: #FFFFFF; border: none; padding: 12px 20px; border-radius: 10px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 8px; }
    .toggle-label { font-size: 13px; font-weight: 600; color: #334155; display: flex; align-items: center; gap: 10px; cursor: pointer; }
    .card-box { background: #FFFFFF; border-radius: 16px; padding: 24px; border: 1px solid #E2E8F0; }
    .margin-top { margin-top: 24px; }
    .summary-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-top: 16px; }
    .sum-item { background: #F8FAFC; padding: 16px; border-radius: 12px; text-align: center; border: 1px solid #E2E8F0; }
    .sum-num { font-size: 28px; font-weight: 800; display: block; color: #0F172A; }
    .sum-label { font-size: 12px; font-weight: 700; color: #64748B; }
    .text-success { color: #16A34A; }
    .text-warning { color: #D97706; }
    .text-danger { color: #DC2626; }
  `]
})
export class ReportsComponent {
  public store = inject(RequestStoreService);
  public configService = inject(ConfigService);
  private notificationService = inject(NotificationService);

  exportPDF() {
    try {
      const doc = new jsPDF();
      doc.setFontSize(18);
      doc.text('Reporte Ejecutivo de Seguimiento de Solicitudes', 14, 20);
      doc.setFontSize(10);
      doc.text(`Fecha de emisión: ${new Date().toLocaleDateString()} | Total registros: ${this.store.metrics().total}`, 14, 28);

      const tableData = this.store.evaluatedRequests().map(r => [
        r.folio,
        r.solicitud,
        this.configService.getAreaById(r.areaId)?.nombre || r.areaId,
        r.estatusId,
        r.fechaVencimiento,
        r.priorityKey || 'NORMAL'
      ]);

      autoTable(doc, {
        startY: 35,
        head: [['Folio', 'Solicitud', 'Área', 'Estatus', 'Vencimiento', 'Prioridad']],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [59, 130, 246] }
      });

      doc.save(`Reporte_Solicitudes_${new Date().toISOString().substring(0, 10)}.pdf`);
      this.notificationService.showSuccess('Reporte PDF generado exitosamente.');
    } catch (err) {
      console.error(err);
      this.notificationService.showError('Error al generar reporte PDF.');
    }
  }

  exportExcel() {
    try {
      const data = this.store.evaluatedRequests().map(r => ({
        Folio: r.folio,
        Solicitud: r.solicitud,
        Área: this.configService.getAreaById(r.areaId)?.nombre || r.areaId,
        Tema: r.tema,
        Tipo: this.configService.getTypeById(r.tipoId)?.nombre || r.tipoId,
        'Fecha Entrada': r.fechaEntrada,
        'Fecha Vencimiento': r.fechaVencimiento,
        'Fecha Término': r.fechaTermino || '',
        Estatus: r.estatusId,
        'Días Restantes': r.diasRestantes,
        Prioridad: r.priorityKey,
        Observaciones: r.observaciones || ''
      }));

      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Solicitudes');
      XLSX.writeFile(wb, `Consolidado_Solicitudes_${new Date().toISOString().substring(0, 10)}.xlsx`);
      this.notificationService.showSuccess('Archivo Excel generado.');
    } catch (err) {
      console.error(err);
      this.notificationService.showError('Error al generar Excel.');
    }
  }
}
