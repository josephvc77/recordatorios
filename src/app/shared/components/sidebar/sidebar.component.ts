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
      <div class="nav-section-title">PRINCIPAL</div>
      
      <a routerLink="/dashboard" routerLinkActive="active" class="nav-item" (click)="onItemClick()">
        <span class="material-icons icon">dashboard</span>
        <span class="label">Dashboard</span>
      </a>

      <a routerLink="/requests" routerLinkActive="active" class="nav-item" (click)="onItemClick()">
        <span class="material-icons icon">table_chart</span>
        <span class="label">Listado Principal</span>
      </a>

      <a routerLink="/kanban" routerLinkActive="active" class="nav-item" (click)="onItemClick()">
        <span class="material-icons icon">view_kanban</span>
        <span class="label">Tablero Kanban</span>
      </a>

      <a routerLink="/calendar" routerLinkActive="active" class="nav-item" (click)="onItemClick()">
        <span class="material-icons icon">calendar_month</span>
        <span class="label">Calendario</span>
      </a>

      <div class="nav-section-title">HERRAMIENTAS</div>

      <a routerLink="/reports" routerLinkActive="active" class="nav-item" (click)="onItemClick()">
        <span class="material-icons icon">assessment</span>
        <span class="label">Reportes y Analítica</span>
      </a>

      <a routerLink="/attachments" routerLinkActive="active" class="nav-item" (click)="onItemClick()">
        <span class="material-icons icon">folder_shared</span>
        <span class="label">Adjuntos Google Drive</span>
      </a>

      <div class="nav-section-title">ADMINISTRACIÓN</div>

      <a routerLink="/settings" routerLinkActive="active" class="nav-item" (click)="onItemClick()">
        <span class="material-icons icon">settings</span>
        <span class="label">Configuración Sistema</span>
      </a>
    </nav>
  `,
  styles: [`
    .sidebar-nav {
      width: 240px;
      background: var(--sidebar-bg, #F8FAFC);
      border-right: 1px solid var(--border-color, #E2E8F0);
      height: 100%;
      padding: 16px 12px;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .nav-section-title {
      font-size: 10px;
      font-weight: 800;
      color: #94A3B8;
      letter-spacing: 1px;
      padding: 12px 12px 4px 12px;
    }
    .nav-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 14px;
      border-radius: 10px;
      color: #475569;
      text-decoration: none;
      font-size: 13px;
      font-weight: 600;
      transition: background 0.15s ease, color 0.15s ease;
    }
    .nav-item:hover {
      background: #E2E8F0;
      color: #0F172A;
    }
    .nav-item.active {
      background: #3B82F6;
      color: #FFFFFF;
    }
    .nav-item.active .icon {
      color: #FFFFFF;
    }
    .icon {
      font-size: 20px;
      color: #64748B;
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
