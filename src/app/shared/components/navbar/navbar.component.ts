import { Component, inject, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../../core/services/auth.service';
import { RequestStoreService } from '../../../core/services/request-store.service';
import { PwaNotificationService } from '../../../core/services/pwa-notification.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, MatMenuModule, MatButtonModule],
  template: `
    <header class="navbar-container">
      <div class="navbar-left">
        <button type="button" class="menu-toggle-btn" (click)="toggleSidebar.emit()" title="Alternar menú lateral">
          <span class="material-icons">menu</span>
        </button>
        
        <div class="brand-group">
          <span class="brand-name">Seguimiento de Solicitudes</span>
          <span class="brand-tag">v4.8 ENTERPRISE</span>
        </div>
      </div>

      <!-- BANNERS DE ALERTAS CRÍTICAS / RECORDATORIOS EN NAVBAR -->
      <div class="navbar-center">
        @for (alert of store.activeAlerts(); track alert.type) {
          <div class="alert-banner" [style.background-color]="alert.color">
            <span class="material-icons animated-icon">priority_high</span>
            <span class="alert-text">{{ alert.message }}</span>
          </div>
        }
      </div>

      <div class="navbar-right">
        <!-- BOTÓN INSTALAR PWA -->
        @if (pwaService.canInstall()) {
          <button type="button" class="install-pwa-btn" (click)="pwaService.installPwa()" title="Instalar Aplicación en este dispositivo">
            <span class="material-icons">install_mobile</span>
            <span class="btn-label">Instalar App</span>
          </button>
        }

        <!-- BOTÓN ALARMA 9:00 AM -->
        <button 
          type="button" 
          class="icon-btn notif-btn" 
          [class.active-notif]="pwaService.notificationPermission() === 'granted'"
          (click)="pwaService.requestNotificationPermission()" 
          title="Activar o probar notificaciones automáticas de las 9:00 AM">
          <span class="material-icons">notifications_active</span>
        </button>

        <!-- INDICADOR INDEXEDDB -->
        <div class="sync-indicator hide-mobile" title="Sincronización activa con Google Sheets & IndexedDB">
          <span class="dot-online"></span>
          <span>IndexedDB en vivo</span>
        </div>

        <!-- MODO OSCURO -->
        <button type="button" class="icon-btn" (click)="toggleDarkMode()" title="Cambiar Tema">
          <span class="material-icons">{{ isDarkMode ? 'light_mode' : 'dark_mode' }}</span>
        </button>
      </div>
    </header>
  `,
  styles: [`
    .navbar-container {
      height: 64px;
      background: rgba(255, 255, 255, 0.9);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border-bottom: 1px solid #E2E8F0;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 20px;
      box-shadow: 0 2px 10px rgba(15, 23, 42, 0.03);
      position: sticky;
      top: 0;
      z-index: 100;
    }
    .navbar-left {
      display: flex;
      align-items: center;
      gap: 14px;
    }
    .menu-toggle-btn {
      background: #F8FAFC;
      border: 1px solid #E2E8F0;
      color: #0F172A;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 8px;
      border-radius: 10px;
      transition: all 0.15s ease;
    }
    .menu-toggle-btn:hover {
      background: #E2E8F0;
      transform: scale(1.03);
    }
    .brand-group {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .brand-name {
      font-size: 16px;
      font-weight: 800;
      color: #0F172A;
      letter-spacing: -0.3px;
    }
    .brand-tag {
      background: #EFF6FF;
      color: #2563EB;
      border: 1px solid #BFDBFE;
      font-size: 10px;
      font-weight: 800;
      padding: 2px 7px;
      border-radius: 6px;
      letter-spacing: 0.5px;
    }
    .navbar-center {
      display: flex;
      gap: 8px;
      overflow-x: auto;
      max-width: 45%;
    }
    .alert-banner {
      color: #FFFFFF;
      font-size: 11px;
      font-weight: 700;
      padding: 5px 12px;
      border-radius: 20px;
      display: flex;
      align-items: center;
      gap: 6px;
      white-space: nowrap;
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
    }
    .navbar-right {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .install-pwa-btn {
      background: linear-gradient(135deg, #10B981 0%, #059669 100%);
      color: #FFFFFF;
      border: none;
      padding: 7px 14px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 800;
      display: flex;
      align-items: center;
      gap: 6px;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
    }
    .sync-indicator {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      font-weight: 700;
      color: #16A34A;
      background: #F0FDF4;
      padding: 5px 12px;
      border-radius: 20px;
      border: 1px solid #DCFCE7;
    }
    .dot-online {
      width: 8px;
      height: 8px;
      background: #16A34A;
      border-radius: 50%;
      box-shadow: 0 0 8px rgba(22, 163, 74, 0.6);
    }
    .icon-btn {
      background: #F8FAFC;
      border: 1px solid #E2E8F0;
      width: 38px;
      height: 38px;
      border-radius: 50%;
      color: #475569;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
    }
    .icon-btn:hover {
      background: #E2E8F0;
      color: #0F172A;
    }
    .notif-btn.active-notif {
      background: #FEF3C7;
      border-color: #FCD34D;
      color: #D97706;
    }
    @media (max-width: 640px) {
      .hide-mobile { display: none; }
      .brand-tag { display: none; }
      .navbar-center { display: none; }
      .btn-label { display: none; }
    }
  `]
})
export class NavbarComponent {
  public authService = inject(AuthService);
  public store = inject(RequestStoreService);
  public pwaService = inject(PwaNotificationService);
  public isDarkMode = false;

  @Output() toggleSidebar = new EventEmitter<void>();

  toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;
    document.body.classList.toggle('dark-theme', this.isDarkMode);
  }
}
