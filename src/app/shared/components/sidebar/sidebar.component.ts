import { Component, inject, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="sidebar-nav">
      <!-- LOGO BRANDING EN SIDEBAR PARA MÓVIL Y DESKTOP -->
      <div class="sidebar-brand-box">
        <div class="brand-logo-icon">
          <span class="material-icons">alarm</span>
        </div>
        <div class="brand-logo-info">
          <span class="brand-title">Recordatorios</span>
          <span class="brand-sub">ENTERPRISE CRM</span>
        </div>
      </div>

      <div class="nav-section-title">MENÚ PRINCIPAL</div>
      
      <a routerLink="/dashboard" routerLinkActive="active" class="nav-item" (click)="onItemClick()">
        <span class="material-icons icon">space_dashboard</span>
        <span class="label">Dashboard</span>
        <span class="active-indicator"></span>
      </a>

      <a routerLink="/requests" routerLinkActive="active" class="nav-item" (click)="onItemClick()">
        <span class="material-icons icon">receipt_long</span>
        <span class="label">Listado Principal</span>
        <span class="active-indicator"></span>
      </a>

      <a routerLink="/kanban" routerLinkActive="active" class="nav-item" (click)="onItemClick()">
        <span class="material-icons icon">view_kanban</span>
        <span class="label">Tablero Kanban</span>
        <span class="active-indicator"></span>
      </a>

      <a routerLink="/calendar" routerLinkActive="active" class="nav-item" (click)="onItemClick()">
        <span class="material-icons icon">edit_calendar</span>
        <span class="label">Calendario</span>
        <span class="active-indicator"></span>
      </a>

      <div class="nav-section-title">HERRAMIENTAS & ANALÍTICA</div>

      <a routerLink="/reports" routerLinkActive="active" class="nav-item" (click)="onItemClick()">
        <span class="material-icons icon">insights</span>
        <span class="label">Reportes y Analítica</span>
        <span class="active-indicator"></span>
      </a>

      <a routerLink="/attachments" routerLinkActive="active" class="nav-item" (click)="onItemClick()">
        <span class="material-icons icon">cloud_done</span>
        <span class="label">Adjuntos Google Drive</span>
        <span class="active-indicator"></span>
      </a>

      <div class="nav-section-title">SISTEMA</div>

      <a routerLink="/settings" routerLinkActive="active" class="nav-item" (click)="onItemClick()">
        <span class="material-icons icon">tune</span>
        <span class="label">Configuración Sistema</span>
        <span class="active-indicator"></span>
      </a>
    </nav>
  `,
  styles: [`
    .sidebar-nav {
      width: 250px;
      background: #0F172A;
      border-right: 1px solid #1E293B;
      height: 100%;
      padding: 20px 14px;
      display: flex;
      flex-direction: column;
      gap: 6px;
      color: #94A3B8;
    }
    .sidebar-brand-box {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 8px 10px 20px 10px;
      border-bottom: 1px solid #1E293B;
      margin-bottom: 8px;
    }
    .brand-logo-icon {
      width: 40px;
      height: 40px;
      background: linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #FFFFFF;
      box-shadow: 0 4px 14px rgba(59, 130, 246, 0.4);
    }
    .brand-logo-icon .material-icons {
      font-size: 22px;
    }
    .brand-logo-info {
      display: flex;
      flex-direction: column;
    }
    .brand-title {
      font-size: 16px;
      font-weight: 800;
      color: #F8FAFC;
      letter-spacing: -0.3px;
    }
    .brand-sub {
      font-size: 9px;
      font-weight: 800;
      color: #3B82F6;
      letter-spacing: 1px;
    }
    .nav-section-title {
      font-size: 10px;
      font-weight: 800;
      color: #475569;
      letter-spacing: 1px;
      padding: 14px 10px 4px 10px;
    }
    .nav-item {
      position: relative;
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 11px 14px;
      border-radius: 12px;
      color: #94A3B8;
      text-decoration: none;
      font-size: 13.5px;
      font-weight: 600;
      transition: all 0.2s ease;
    }
    .nav-item:hover {
      background: #1E293B;
      color: #F8FAFC;
    }
    .nav-item:hover .icon {
      color: #60A5FA;
      transform: scale(1.1);
    }
    .nav-item.active {
      background: linear-gradient(90deg, rgba(59, 130, 246, 0.2) 0%, rgba(59, 130, 246, 0.05) 100%);
      color: #60A5FA;
      font-weight: 700;
      border-left: 3px solid #3B82F6;
    }
    .nav-item.active .icon {
      color: #60A5FA;
    }
    .active-indicator {
      display: none;
    }
    .icon {
      font-size: 21px;
      color: #64748B;
      transition: transform 0.2s ease, color 0.2s ease;
    }
  `]
})
export class SidebarComponent {
  public authService = inject(AuthService);
  @Output() closeSidebar = new EventEmitter<void>();

  onItemClick() {
    this.closeSidebar.emit();
  }
}
