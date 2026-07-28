import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { SidebarComponent } from './shared/components/sidebar/sidebar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent, SidebarComponent],
  template: `
    <div class="app-layout">
      <app-navbar (toggleSidebar)="toggleSidebar()"></app-navbar>

      <div class="main-body">
        <!-- SIDEBAR CONTAINER CON ACCESIBILIDAD MÓVIL (OVERLAY EN PANTALLAS PEQUEÑAS) -->
        <div class="sidebar-wrapper" [class.open]="sidebarOpen">
          <app-sidebar (closeSidebar)="closeSidebarMobile()"></app-sidebar>
        </div>

        <!-- FONDO OSCURO PARA MÓVIL -->
        @if (sidebarOpen) {
          <div class="mobile-backdrop" (click)="sidebarOpen = false"></div>
        }

        <main class="content-area">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
  styles: [`
    .app-layout {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      background: var(--bg-main, #F1F5F9);
    }
    .main-body {
      display: flex;
      flex: 1;
      position: relative;
      overflow: hidden;
    }
    .sidebar-wrapper {
      position: relative;
      z-index: 90;
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .content-area {
      flex: 1;
      overflow-y: auto;
      height: calc(100vh - 64px);
    }
    .mobile-backdrop {
      display: none;
    }

    @media (max-width: 768px) {
      .sidebar-wrapper {
        position: fixed;
        top: 64px;
        left: -260px;
        bottom: 0;
        z-index: 999;
      }
      .sidebar-wrapper.open {
        left: 0;
        box-shadow: 4px 0 24px rgba(15, 23, 42, 0.25);
      }
      .mobile-backdrop {
        display: block;
        position: fixed;
        top: 64px;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(15, 23, 42, 0.5);
        backdrop-filter: blur(4px);
        z-index: 990;
      }
    }
  `]
})
export class AppComponent {
  title = 'recordatorios-app';
  sidebarOpen = window.innerWidth > 768;

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  closeSidebarMobile() {
    if (window.innerWidth <= 768) {
      this.sidebarOpen = false;
    }
  }
}
