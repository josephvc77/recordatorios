import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConfigService } from '../../core/services/config.service';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { StatusConfig, DueRuleConfig, AreaConfig } from '../../domain/models/config.model';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="settings-page">
      <!-- HEADER CON TÍTULO PRINCIPAL -->
      <div class="page-header">
        <div>
          <h1 class="page-title">Configuración del Sistema</h1>
          <p class="page-subtitle">Administre estatus, colores, reglas de vencimiento y catálogo de áreas turnadas</p>
        </div>
      </div>

      <!-- TABS DE NAVEGACIÓN ELEGANTE -->
      <div class="tab-container">
        <button [class.active]="activeTab === 'areas'" (click)="activeTab = 'areas'">
          <span class="material-icons">account_tree</span>
          <span>Catálogo de Áreas Turnadas</span>
        </button>
        <button [class.active]="activeTab === 'statuses'" (click)="activeTab = 'statuses'">
          <span class="material-icons">palette</span>
          <span>Estatus & Colores</span>
        </button>
        <button [class.active]="activeTab === 'rules'" (click)="activeTab = 'rules'">
          <span class="material-icons">notifications_active</span>
          <span>Reglas del Motor de Vencimientos</span>
        </button>
        <button [class.active]="activeTab === 'api'" (click)="activeTab = 'api'">
          <span class="material-icons">api</span>
          <span>Conexión API Google Apps Script</span>
        </button>
      </div>

      <!-- TAB 1: CATÁLOGO DE ÁREAS TURNADAS -->
      @if (activeTab === 'areas') {
        <div class="settings-card">
          <div class="card-header">
            <div class="header-icon bg-blue">
              <span class="material-icons">account_tree</span>
            </div>
            <div class="header-text">
              <h3>Catálogo de Áreas Turnadas</h3>
              <p>Edite o agregue áreas turnadas que se mostrarán en los formularios y filtros de solicitudes.</p>
            </div>
            <button class="btn-secondary" (click)="addArea()">
              <span class="material-icons">add</span> Agregar Área
            </button>
          </div>

          <div class="items-table">
            <div class="table-header-row">
              <div class="col-id">CLAVE / ID</div>
              <div class="col-flex">NOMBRE DE ÁREA TURNADA</div>
              <div class="col-flex">RESPONSABLE</div>
              <div class="col-action"></div>
            </div>

            @for (area of areas(); track area.id; let idx = $index) {
              <div class="item-row">
                <div class="col-id">
                  <input type="text" [(ngModel)]="area.id" placeholder="Ej. INGER">
                </div>
                <div class="col-flex">
                  <input type="text" [(ngModel)]="area.nombre" placeholder="Nombre del Área">
                </div>
                <div class="col-flex">
                  <input type="text" [(ngModel)]="area.responsable" placeholder="Responsable (Opcional)">
                </div>
                <div class="col-action">
                  <button class="btn-icon-danger" (click)="removeArea(idx)" title="Eliminar área">
                    <span class="material-icons">delete</span>
                  </button>
                </div>
              </div>
            }
          </div>

          <div class="card-footer">
            <button class="btn-primary" (click)="saveAreas()" [disabled]="isSaving">
              <span class="material-icons">cloud_upload</span>
              {{ isSaving ? 'Guardando en Sheets...' : 'Guardar Áreas en Google Sheets' }}
            </button>
          </div>
        </div>
      }

      <!-- TAB 2: ESTATUS & COLORES -->
      @if (activeTab === 'statuses') {
        <div class="settings-card">
          <div class="card-header">
            <div class="header-icon bg-purple">
              <span class="material-icons">palette</span>
            </div>
            <div class="header-text">
              <h3>Estatus y Colores de Seguimiento</h3>
              <p>Configure los estados de vida de las solicitudes y sus colores identificadores.</p>
            </div>
            <button class="btn-secondary" (click)="addStatus()">
              <span class="material-icons">add</span> Agregar Estatus
            </button>
          </div>

          <div class="items-table">
            <div class="table-header-row">
              <div class="col-id">CLAVE ID</div>
              <div class="col-flex">NOMBRE DE ESTATUS</div>
              <div class="col-color">COLOR IDENTIFICADOR</div>
              <div class="col-action"></div>
            </div>

            @for (st of statuses(); track st.id; let idx = $index) {
              <div class="item-row">
                <div class="col-id">
                  <input type="text" [(ngModel)]="st.id" placeholder="EST-XXX">
                </div>
                <div class="col-flex">
                  <input type="text" [(ngModel)]="st.nombre" placeholder="Nombre de Estatus">
                </div>
                <div class="col-color color-picker-cell">
                  <input type="color" [(ngModel)]="st.colorHex" class="color-picker-input">
                  <span class="color-preview-badge" [style.background-color]="st.colorHex">
                    {{ st.colorHex }}
                  </span>
                </div>
                <div class="col-action">
                  <button class="btn-icon-danger" (click)="removeStatus(idx)" title="Eliminar estatus">
                    <span class="material-icons">delete</span>
                  </button>
                </div>
              </div>
            }
          </div>

          <div class="card-footer">
            <button class="btn-primary" (click)="saveStatuses()" [disabled]="isSaving">
              <span class="material-icons">cloud_upload</span>
              {{ isSaving ? 'Guardando en Sheets...' : 'Guardar Estatus en Google Sheets' }}
            </button>
          </div>
        </div>
      }

      <!-- TAB 3: REGLAS DEL MOTOR DE VENCIMIENTOS -->
      @if (activeTab === 'rules') {
        <div class="settings-card">
          <div class="card-header">
            <div class="header-icon bg-amber">
              <span class="material-icons">notifications_active</span>
            </div>
            <div class="header-text">
              <h3>Reglas del Motor de Vencimientos</h3>
              <p>Defina los umbrales de días restantes para activar las alertas visuales y mensajes automáticos.</p>
            </div>
          </div>

          <div class="rules-container">
            @for (rule of dueRules(); track rule.id) {
              <div class="rule-card">
                <div class="rule-card-top">
                  <div class="rule-title-group">
                    <span class="rule-tag" [style.background-color]="rule.colorHex">
                      {{ rule.diasUmbral >= 99 ? 'Normal (>5d)' : (rule.diasUmbral + ' Días') }}
                    </span>
                    <h4 class="rule-name">{{ rule.prioridadNombre }}</h4>
                  </div>
                  <div class="color-picker-cell">
                    <label class="small-label">Color Alerta</label>
                    <input type="color" [(ngModel)]="rule.colorHex" class="color-picker-input">
                  </div>
                </div>

                <div class="rule-card-body">
                  <div class="field-box">
                    <label>Mensaje Alerta Automático</label>
                    <input type="text" [(ngModel)]="rule.mensajeAlerta" placeholder="Ej. Próximo a vencer (4 días)">
                  </div>
                </div>
              </div>
            }
          </div>

          <div class="card-footer">
            <button class="btn-primary" (click)="saveRules()" [disabled]="isSaving">
              <span class="material-icons">cloud_upload</span>
              {{ isSaving ? 'Guardando en Sheets...' : 'Guardar Reglas en Google Sheets' }}
            </button>
          </div>
        </div>
      }

      <!-- TAB 4: ENLACE API -->
      @if (activeTab === 'api') {
        <div class="settings-card">
          <div class="card-header">
            <div class="header-icon bg-emerald">
              <span class="material-icons">api</span>
            </div>
            <div class="header-text">
              <h3>Conexión API / Google Apps Script</h3>
              <p>Dirección del endpoint REST configurado como Aplicación Web en Google Apps Script.</p>
            </div>
          </div>

          <div class="api-box">
            <label>URL del Web App (doGet / doPost)</label>
            <input type="text" [(ngModel)]="scriptUrl" class="input-api-url" placeholder="https://script.google.com/macros/s/.../exec">
          </div>

          <div class="card-footer">
            <button class="btn-primary" (click)="saveUrl()">
              <span class="material-icons">link</span> Actualizar URL de API
            </button>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .settings-page {
      padding: 28px;
    }
    .page-header {
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
    .tab-container {
      display: flex;
      gap: 8px;
      border-bottom: 2px solid #E2E8F0;
      margin-bottom: 28px;
      overflow-x: auto;
    }
    .tab-container button {
      background: transparent;
      border: none;
      padding: 12px 18px;
      font-size: 13.5px;
      font-weight: 700;
      color: #64748B;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
      border-bottom: 3px solid transparent;
      transition: all 0.2s ease;
      white-space: nowrap;
    }
    .tab-container button.active {
      color: #2563EB;
      border-bottom-color: #2563EB;
      background: #EFF6FF;
      border-radius: 8px 8px 0 0;
    }
    .settings-card {
      background: #FFFFFF;
      border-radius: 18px;
      border: 1px solid #E2E8F0;
      padding: 28px;
      box-shadow: 0 4px 20px rgba(15, 23, 42, 0.04);
    }
    .card-header {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 24px;
    }
    .header-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .bg-blue { background: #EFF6FF; color: #2563EB; }
    .bg-purple { background: #F3E8FF; color: #7C3AED; }
    .bg-amber { background: #FEF3C7; color: #D97706; }
    .bg-emerald { background: #D1FAE5; color: #059669; }

    .header-text { flex: 1; }
    .header-text h3 {
      font-size: 18px;
      font-weight: 800;
      color: #0F172A;
      margin: 0 0 2px 0;
    }
    .header-text p {
      font-size: 13px;
      color: #64748B;
      margin: 0;
    }
    .items-table {
      display: flex;
      flex-direction: column;
      gap: 10px;
      margin-bottom: 24px;
    }
    .table-header-row {
      display: flex;
      gap: 12px;
      font-size: 11px;
      font-weight: 800;
      color: #64748B;
      padding: 0 8px;
      letter-spacing: 0.5px;
    }
    .item-row {
      display: flex;
      gap: 12px;
      align-items: center;
      background: #F8FAFC;
      padding: 10px 12px;
      border-radius: 12px;
      border: 1px solid #E2E8F0;
    }
    .col-id { width: 150px; }
    .col-flex { flex: 1; }
    .col-color { width: 200px; }
    .col-action { width: 40px; text-align: right; }

    .item-row input[type="text"] {
      width: 100%;
      padding: 9px 12px;
      border-radius: 8px;
      border: 1px solid #CBD5E1;
      font-size: 13px;
      color: #0F172A;
      outline: none;
      background: #FFFFFF;
    }
    .item-row input[type="text"]:focus {
      border-color: #2563EB;
      box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
    }
    .color-picker-cell {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .color-picker-input {
      border: none;
      width: 38px;
      height: 38px;
      border-radius: 8px;
      cursor: pointer;
      background: transparent;
    }
    .color-preview-badge {
      color: #FFFFFF;
      font-size: 12px;
      font-weight: 700;
      padding: 4px 10px;
      border-radius: 6px;
      letter-spacing: 0.5px;
    }
    .btn-icon-danger {
      background: transparent;
      border: none;
      color: #EF4444;
      cursor: pointer;
      padding: 6px;
      border-radius: 6px;
    }
    .btn-icon-danger:hover {
      background: #FEE2E2;
    }
    .rules-container {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }
    .rule-card {
      background: #F8FAFC;
      border: 1px solid #E2E8F0;
      border-radius: 14px;
      padding: 16px;
    }
    .rule-card-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }
    .rule-title-group {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .rule-tag {
      color: #FFFFFF;
      font-size: 11px;
      font-weight: 800;
      padding: 3px 8px;
      border-radius: 6px;
    }
    .rule-name {
      font-size: 14px;
      font-weight: 800;
      color: #0F172A;
      margin: 0;
    }
    .small-label {
      font-size: 11px;
      color: #64748B;
      font-weight: 600;
    }
    .field-box label {
      display: block;
      font-size: 12px;
      font-weight: 700;
      color: #475569;
      margin-bottom: 6px;
    }
    .field-box input {
      width: 100%;
      padding: 9px 12px;
      border-radius: 8px;
      border: 1px solid #CBD5E1;
      font-size: 13px;
      background: #FFFFFF;
      outline: none;
    }
    .api-box label {
      display: block;
      font-size: 12px;
      font-weight: 700;
      color: #475569;
      margin-bottom: 6px;
    }
    .input-api-url {
      width: 100%;
      padding: 12px;
      border-radius: 10px;
      border: 1px solid #CBD5E1;
      font-size: 14px;
      background: #F8FAFC;
      outline: none;
    }
    .card-footer {
      display: flex;
      justify-content: flex-end;
      padding-top: 18px;
      border-top: 1px solid #E2E8F0;
    }
    .btn-primary {
      background: linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%);
      color: #FFFFFF;
      border: none;
      padding: 11px 22px;
      border-radius: 10px;
      font-size: 14px;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
    }
    .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
    .btn-secondary {
      background: #F1F5F9;
      color: #334155;
      border: 1px solid #CBD5E1;
      padding: 9px 16px;
      border-radius: 9px;
      font-size: 13px;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 6px;
      cursor: pointer;
    }
  `]
})
export class SettingsComponent {
  public configService = inject(ConfigService);
  private apiService = inject(ApiService);
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);

  public activeTab: 'areas' | 'statuses' | 'rules' | 'api' = 'areas';
  public scriptUrl = this.apiService.getScriptUrl();
  public isSaving = false;

  public areas = signal<AreaConfig[]>([...this.configService.config().areas]);
  public statuses = signal<StatusConfig[]>([...this.configService.config().statuses]);
  public dueRules = signal<DueRuleConfig[]>([...this.configService.config().dueRules]);

  addArea() {
    this.areas.update(list => [...list, { id: `AREA-${Date.now().toString().slice(-4)}`, nombre: '', responsable: '' }]);
  }

  removeArea(idx: number) {
    this.areas.update(list => list.filter((_, i) => i !== idx));
  }

  async saveAreas() {
    this.isSaving = true;
    const items = this.areas();
    this.configService.setConfig({ areas: items });
    
    const res = await this.postCatalogSave('Cat_Areas', items);
    if (res.success || !res.error) {
      this.notificationService.showSuccess('Catálogo de Áreas guardado exitosamente en Google Sheets.');
    } else {
      this.notificationService.showError(`Error al guardar: ${res.message || ''}`);
    }
    this.isSaving = false;
  }

  addStatus() {
    this.statuses.update(list => [...list, { id: `EST-${Date.now().toString().slice(-4)}`, nombre: '', colorHex: '#3B82F6', orden: list.length + 1 }]);
  }

  removeStatus(idx: number) {
    this.statuses.update(list => list.filter((_, i) => i !== idx));
  }

  async saveStatuses() {
    this.isSaving = true;
    const items = this.statuses();
    this.configService.setConfig({ statuses: items });
    const res = await this.postCatalogSave('Cat_Estatus', items);
    if (res.success || !res.error) {
      this.notificationService.showSuccess('Catálogo de Estatus y Colores guardado en Google Sheets.');
    } else {
      this.notificationService.showError(`Error al guardar: ${res.message || ''}`);
    }
    this.isSaving = false;
  }

  async saveRules() {
    this.isSaving = true;
    const items = this.dueRules();
    this.configService.setConfig({ dueRules: items });
    const res = await this.postCatalogSave('Cat_ReglasVencimiento', items);
    if (res.success || !res.error) {
      this.notificationService.showSuccess('Reglas del Motor de Vencimientos guardadas en Google Sheets.');
    } else {
      this.notificationService.showError(`Error al guardar: ${res.message || ''}`);
    }
    this.isSaving = false;
  }

  saveUrl() {
    this.apiService.setScriptUrl(this.scriptUrl);
    this.notificationService.showSuccess('URL de Google Apps Script actualizada.');
  }

  private async postCatalogSave(catalogName: string, items: any[]) {
    const userEmail = this.authService.currentUser().email;
    return this.apiService.postRequest('config', 'save', { catalogName, items }, userEmail);
  }
}
