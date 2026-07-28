import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { 
    path: 'dashboard', 
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent) 
  },
  { 
    path: 'requests', 
    loadComponent: () => import('./features/request-list/request-list.component').then(m => m.RequestListComponent) 
  },
  { 
    path: 'requests/:id', 
    loadComponent: () => import('./features/request-detail/request-detail.component').then(m => m.RequestDetailComponent) 
  },
  { 
    path: 'kanban', 
    loadComponent: () => import('./features/kanban/kanban.component').then(m => m.KanbanComponent) 
  },
  { 
    path: 'calendar', 
    loadComponent: () => import('./features/calendar/calendar.component').then(m => m.CalendarComponent) 
  },
  { 
    path: 'reports', 
    loadComponent: () => import('./features/reports/reports.component').then(m => m.ReportsComponent) 
  },
  { 
    path: 'attachments', 
    loadComponent: () => import('./features/attachments/attachments.component').then(m => m.AttachmentsComponent) 
  },
  { 
    path: 'settings', 
    loadComponent: () => import('./features/settings/settings.component').then(m => m.SettingsComponent) 
  },
  { path: '**', redirectTo: 'dashboard' }
];
