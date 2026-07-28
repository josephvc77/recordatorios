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
      <app-navbar (toggleSidebar)="sidebarOpen = !sidebarOpen"></app-navbar>

      <div class="main-body">
        @if (sidebarOpen) {
          <app-sidebar></app-sidebar>
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
    }
    .content-area {
      flex: 1;
      overflow-y: auto;
      height: calc(100vh - 60px);
    }
  `]
})
export class AppComponent {
  title = 'recordatorios-app';
  sidebarOpen = true;
}
