import { Component, inject, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../../core/services/auth.service';
import { RequestStoreService } from '../../../core/services/request-store.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, MatMenuModule, MatButtonModule],
  template: `
    <header class="navbar-container">
      <div class="navbar-left">
        <button type="button" class="menu-toggle-btn" (click)="toggleSidebar.emit()" title="Alternar menú">
          <span class="material-icons">menu</span>
        </button>
        <div class="brand">
          <span class="brand-text">Recordatorios</span>
          <span class="brand-badge">ENTERPRISE</span>
        </div>
      </div>

      <!-- BANNERS DE ALERTAS CRÍTICAS / RECORDATORIOS -->
      <div class="navbar-center">
        @for (alert of store.activeAlerts(); track alert.type) {
          <div class="alert-banner" [style.background-color]="alert.color">
            <span class="material-icons animated-icon">priority_high</span>
            <span class="alert-text">{{ alert.message }}</span>
          </div>
        }
      </div>

      <div class="navbar-right">
        <!-- ESTADO DE CONEXIÓN E INDEXEDDB -->
        <div class="sync-indicator" title="Sincronización activa con Google Sheets & IndexedDB">
          <span class="dot-online"></span>
          <span>IndexedDB Activo</span>
        </div>

        <!-- BOTÓN MODO OSCURO -->
        <button type="button" class="icon-btn" (click)="toggleDarkMode()" title="Modo Oscuro">
          <span class="material-icons">{{ isDarkMode ? 'light_mode' : 'dark_mode' }}</span>
        </button>
      </div>
    </header>
  `,
  styles: [`
    .navbar-container {
      height: 64px;
      background: #FFFFFF;
      border-bottom: 1px solid #E2E8F0;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 24px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.03);
      position: sticky;
      top: 0;
      z-index: 100;
    }
    .navbar-left {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .menu-toggle-btn {
      background: transparent;
      border: none;
      color: #64748B;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 6px;
      border-radius: 8px;
      transition: background 0.15s ease;
    }
    .menu-toggle-btn:hover {
      background: #F1F5F9;
      color: #0F172A;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .brand-text {
      font-size: 20px;
      font-weight: 800;
      letter-spacing: -0.5px;
      color: #0F172A;
    }
    .brand-badge {
      background: #2563EB;
      color: #FFFFFF;
      font-size: 9px;
      font-weight: 800;
      padding: 2px 6px;
      border-radius: 4px;
      letter-spacing: 0.5px;
    }
    .navbar-center {
      display: flex;
      gap: 12px;
      overflow-x: auto;
      max-width: 50%;
    }
    .alert-banner {
      color: #FFFFFF;
      font-size: 12px;
      font-weight: 700;
      padding: 6px 14px;
      border-radius: 20px;
      display: flex;
      align-items: center;
      gap: 6px;
      white-space: nowrap;
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
      animation: fadeIn 0.3s ease;
    }
    .animated-icon {
      font-size: 16px;
      animation: pulse 1.5s infinite;
    }
    @keyframes pulse {
      0% { transform: scale(1); }
      50% { transform: scale(1.2); }
      100% { transform: scale(1); }
    }
    .navbar-right {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .sync-indicator {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      font-weight: 600;
      color: #16A34A;
      background: #F0FDF4;
      padding: 4px 10px;
      border-radius: 20px;
      border: 1px solid #DCFCE7;
    }
    .dot-online {
      width: 8px;
      height: 8px;
      background: #16A34A;
      border-radius: 50%;
      box-shadow: 0 0 6px rgba(22, 163, 74, 0.6);
    }
    .icon-btn {
      background: #F1F5F9;
      border: none;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      color: #475569;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.15s ease;
    }
    .icon-btn:hover {
      background: #E2E8F0;
      color: #0F172A;
    }
  `]
})
export class NavbarComponent {
  public authService = inject(AuthService);
  public store = inject(RequestStoreService);
  public isDarkMode = false;

  @Output() toggleSidebar = new EventEmitter<void>();

  toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;
    document.body.classList.toggle('dark-theme', this.isDarkMode);
  }
}
