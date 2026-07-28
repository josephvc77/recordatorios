import { Component, Inject, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { RequestStoreService } from '../../core/services/request-store.service';
import { ConfigService } from '../../core/services/config.service';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-request-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule],
  template: `
    <div class="modal-card">
      <!-- HEADER CON GRADIENTE Y CERRAR -->
      <div class="modal-header">
        <div class="header-title-group">
          <div class="header-icon-box">
            <span class="material-icons">{{ data.mode === 'create' ? 'add_task' : 'edit_note' }}</span>
          </div>
          <div>
            <h2>{{ data.mode === 'create' ? 'Registrar Nueva Solicitud' : 'Editar Solicitud' }}</h2>
            <p class="header-subtitle">
              {{ data.mode === 'create' ? 'Complete la información requerida para el seguimiento y semáforo automático.' : 'Actualice los parámetros o el estatus del expediente.' }}
            </p>
          </div>
        </div>
        <button type="button" class="close-circle-btn" (click)="dialogRef.close()" title="Cerrar modal">
          <span class="material-icons">close</span>
        </button>
      </div>

      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="modal-form-body">
        
        <!-- SECCIÓN 1: DATOS CLAVE -->
        <div class="form-section">
          <div class="section-badge">
            <span class="material-icons">folder_open</span>
            <span>INFORMACIÓN PRINCIPAL</span>
          </div>

          <div class="form-grid">
            <div class="field-item col-6">
              <label>Folio Administrativo *</label>
              <div class="input-with-icon">
                <span class="material-icons field-icon">tag</span>
                <input type="text" formControlName="folio" placeholder="">
              </div>
            </div>

            <div class="field-item col-6">
              <label>Área Turnada *</label>
              <div class="input-with-icon">
                <span class="material-icons field-icon">account_tree</span>
                <select formControlName="areaId">
                  @for (area of configService.config().areas; track area.id) {
                    <option [value]="area.id">{{ area.nombre }}</option>
                  }
                </select>
              </div>
            </div>

            <div class="field-item col-12">
              <label>Solicitud *</label>
              <div class="input-with-icon">
                <span class="material-icons field-icon">description</span>
                <input type="text" formControlName="solicitud" placeholder="">
              </div>
            </div>
          </div>
        </div>

        <!-- SECCIÓN 2: CLASIFICACIÓN Y VENCIMIENTOS -->
        <div class="form-section">
          <div class="section-badge">
            <span class="material-icons">event_note</span>
            <span>CLASIFICACIÓN Y TIEMPOS</span>
          </div>

          <div class="form-grid">
            <div class="field-item col-6">
              <label>Tema *</label>
              <div class="input-with-icon">
                <span class="material-icons field-icon">topic</span>
                <input type="text" formControlName="tema" placeholder="">
              </div>
            </div>

            <div class="field-item col-6">
              <label>Tipo de Solicitud *</label>
              <div class="input-with-icon">
                <span class="material-icons field-icon">category</span>
                <select formControlName="tipoId">
                  @for (tipo of configService.config().types; track tipo.id) {
                    <option [value]="tipo.id">{{ tipo.nombre }}</option>
                  }
                </select>
              </div>
            </div>

            <div class="field-item col-6">
              <label>Clasificación IP / DP *</label>
              <div class="input-with-icon">
                <span class="material-icons field-icon">security</span>
                <select formControlName="ipDp">
                  <option value="INFORMACION PUBLICA">INFORMACION PUBLICA</option>
                  <option value="DATOS PERSONALES">DATOS PERSONALES</option>
                  <option value="INFORMACION PUBLICA / DATOS PERSONALES">INFORMACION PUBLICA / DATOS PERSONALES</option>
                </select>
              </div>
            </div>

            <div class="field-item col-6">
              <label>Estatus Inicial *</label>
              <div class="input-with-icon">
                <span class="material-icons field-icon">flag</span>
                <select formControlName="estatusId">
                  @for (st of configService.config().statuses; track st.id) {
                    <option [value]="st.id">{{ st.nombre }}</option>
                  }
                </select>
              </div>
            </div>

            <div class="field-item col-4">
              <label>Fecha Entrada *</label>
              <div class="input-with-icon">
                <span class="material-icons field-icon">login</span>
                <input type="date" formControlName="fechaEntrada">
              </div>
            </div>

            <div class="field-item col-4">
              <label>Fecha Vencimiento *</label>
              <div class="input-with-icon">
                <span class="material-icons field-icon">event_available</span>
                <input type="date" formControlName="fechaVencimiento">
              </div>
            </div>

            <div class="field-item col-4">
              <label>Fecha Término</label>
              <div class="input-with-icon">
                <span class="material-icons field-icon">task_alt</span>
                <input type="date" formControlName="fechaTermino">
              </div>
            </div>
          </div>
        </div>

        <!-- SECCIÓN 3: OBSERVACIONES -->
        <div class="form-section no-border">
          <div class="section-badge">
            <span class="material-icons">chat</span>
            <span>OBSERVACIONES Y NOTAS DE SEGUIMIENTO</span>
          </div>

          <div class="field-item col-12">
            <div class="input-with-icon align-start">
              <span class="material-icons field-icon mt-2">notes</span>
              <textarea formControlName="observaciones" rows="3" placeholder=""></textarea>
            </div>
          </div>
        </div>

        <!-- FOOTER DE ACCIONES -->
        <div class="modal-actions">
          <button type="button" class="btn-cancel" (click)="dialogRef.close()">
            Cancelar
          </button>
          <button type="submit" class="btn-save" [disabled]="form.invalid || isSubmitting">
            @if (isSubmitting) {
              <span class="material-icons spin">sync</span> Guardando...
            } @else {
              <span class="material-icons">check_circle</span>
              {{ data.mode === 'create' ? 'Crear Solicitud' : 'Guardar Cambios' }}
            }
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .modal-card {
      background: #FFFFFF;
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 20px 40px rgba(15, 23, 42, 0.15);
      border: 1px solid #E2E8F0;
    }
    .modal-header {
      background: linear-gradient(135deg, #1E293B 0%, #0F172A 100%);
      padding: 24px 28px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      color: #FFFFFF;
    }
    .header-title-group {
      display: flex;
      gap: 16px;
      align-items: center;
    }
    .header-icon-box {
      width: 48px;
      height: 48px;
      background: rgba(59, 130, 246, 0.2);
      border: 1px solid rgba(59, 130, 246, 0.4);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #60A5FA;
    }
    .header-icon-box .material-icons {
      font-size: 26px;
    }
    .header-title-group h2 {
      font-size: 20px;
      font-weight: 800;
      margin: 0 0 4px 0;
      color: #F8FAFC;
    }
    .header-subtitle {
      font-size: 13px;
      color: #94A3B8;
      margin: 0;
      max-width: 440px;
      line-height: 1.3;
    }
    .close-circle-btn {
      background: rgba(255, 255, 255, 0.1);
      border: none;
      color: #94A3B8;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.15s ease;
    }
    .close-circle-btn:hover {
      background: rgba(255, 255, 255, 0.2);
      color: #FFFFFF;
    }
    .modal-form-body {
      padding: 24px 28px;
      max-height: 80vh;
      overflow-y: auto;
    }
    .form-section {
      margin-bottom: 24px;
      padding-bottom: 20px;
      border-bottom: 1px dashed #E2E8F0;
    }
    .no-border { border-bottom: none; }
    .section-badge {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 11px;
      font-weight: 800;
      color: #3B82F6;
      letter-spacing: 0.8px;
      margin-bottom: 14px;
      text-transform: uppercase;
    }
    .section-badge .material-icons {
      font-size: 16px;
    }
    .form-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
    }
    .field-item {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .col-12 { width: 100%; }
    .col-6 { width: calc(50% - 8px); }
    .col-4 { width: calc(33.333% - 11px); }
    
    .field-item label {
      font-size: 12px;
      font-weight: 700;
      color: #475569;
    }
    .input-with-icon {
      position: relative;
      display: flex;
      align-items: center;
    }
    .align-start {
      align-items: flex-start;
    }
    .mt-2 { margin-top: 10px; }
    .field-icon {
      position: absolute;
      left: 12px;
      color: #94A3B8;
      font-size: 20px;
      pointer-events: none;
    }
    .input-with-icon input,
    .input-with-icon select,
    .input-with-icon textarea {
      width: 100%;
      padding: 10px 14px 10px 40px;
      border-radius: 10px;
      border: 1px solid #CBD5E1;
      font-size: 13.5px;
      color: #0F172A;
      background: #F8FAFC;
      outline: none;
      transition: all 0.2s ease;
    }
    .input-with-icon input:focus,
    .input-with-icon select:focus,
    .input-with-icon textarea:focus {
      background: #FFFFFF;
      border-color: #3B82F6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
    }
    .modal-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      padding-top: 16px;
      border-top: 1px solid #E2E8F0;
    }
    .btn-cancel {
      background: #F1F5F9;
      color: #475569;
      border: 1px solid #CBD5E1;
      padding: 11px 22px;
      border-radius: 10px;
      font-size: 14px;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.15s ease;
    }
    .btn-cancel:hover {
      background: #E2E8F0;
      color: #1E293B;
    }
    .btn-save {
      background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%);
      color: #FFFFFF;
      border: none;
      padding: 11px 24px;
      border-radius: 10px;
      font-size: 14px;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      box-shadow: 0 4px 14px rgba(37, 99, 235, 0.35);
      transition: all 0.15s ease;
    }
    .btn-save:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 6px 18px rgba(37, 99, 235, 0.45);
    }
    .btn-save:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    .spin {
      animation: spinAnimation 1s infinite linear;
    }
    @keyframes spinAnimation {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `]
})
export class RequestFormComponent {
  private fb = inject(FormBuilder);
  private store = inject(RequestStoreService);
  public configService = inject(ConfigService);
  private notificationService = inject(NotificationService);

  public isSubmitting = false;
  public form: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<RequestFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { mode: 'create' | 'edit'; request?: any }
  ) {
    const req = data.request || {};
    const today = new Date().toISOString().substring(0, 10);
    const in5days = new Date(Date.now() + 5 * 86400000).toISOString().substring(0, 10);

    const defaultArea = this.configService.config().areas[0]?.id || 'INGER';

    this.form = this.fb.group({
      folio: [req.folio || '', Validators.required],
      areaId: [req.areaId || defaultArea, Validators.required],
      solicitud: [req.solicitud || '', Validators.required],
      tema: [req.tema || '', Validators.required],
      tipoId: [req.tipoId || 'TIPO-GEN', Validators.required],
      ipDp: [req.ipDp || 'INFORMACION PUBLICA', Validators.required],
      fechaEntrada: [req.fechaEntrada || today, Validators.required],
      fechaVencimiento: [req.fechaVencimiento || in5days, Validators.required],
      fechaTermino: [req.fechaTermino || ''],
      estatusId: [req.estatusId || 'EST-ANA', Validators.required],
      observaciones: [req.observaciones || '']
    });
  }

  async onSubmit() {
    if (this.form.invalid) return;

    this.isSubmitting = true;
    const formVal = this.form.value;

    if (this.data.mode === 'create') {
      const ok = await this.store.createRequest(formVal);
      if (ok) {
        this.notificationService.showSuccess('Solicitud creada exitosamente.');
        this.dialogRef.close(true);
      } else {
        this.notificationService.showError('Error al crear solicitud.');
      }
    } else {
      const ok = await this.store.updateRequest({ id: this.data.request.id, ...formVal });
      if (ok) {
        this.notificationService.showSuccess('Solicitud actualizada.');
        this.dialogRef.close(true);
      } else {
        this.notificationService.showError('Error al actualizar solicitud.');
      }
    }

    this.isSubmitting = false;
  }
}
