import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { PermissionKey } from '../../domain/models/user.model';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="users-page">
      <div class="page-header">
        <div>
          <h1 class="page-title">Gestión de Usuarios y Permisos (RBAC)</h1>
          <p class="page-subtitle">Control granular de matriz de permisos por usuario y rol</p>
        </div>
      </div>

      <div class="table-container">
        <table class="m3-table">
          <thead>
            <tr>
              <th>USUARIO</th>
              <th>EMAIL</th>
              <th>ESTADO</th>
              <th>PERMISOS ACTIVOS</th>
            </tr>
          </thead>
          <tbody>
            @for (user of authService.availableUsers(); track user.idUsuario) {
              <tr>
                <td>
                  <div class="user-row-info">
                    <img [src]="user.fotoUrl" class="avatar" alt="Avatar">
                    <span class="user-name">{{ user.nombre }}</span>
                  </div>
                </td>
                <td>{{ user.email }}</td>
                <td>
                  <span class="status-badge" [class.active]="user.activo">
                    {{ user.activo ? 'ACTIVO' : 'INACTIVO' }}
                  </span>
                </td>
                <td>
                  <div class="perm-tags">
                    @for (perm of user.permisos; track perm) {
                      <span class="perm-chip">{{ perm }}</span>
                    }
                  </div>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .users-page { padding: 24px; }
    .page-header { margin-bottom: 24px; }
    .page-title { font-size: 24px; font-weight: 800; color: #0F172A; margin: 0 0 4px 0; }
    .page-subtitle { font-size: 14px; color: #64748B; margin: 0; }
    .table-container { background: #FFFFFF; border-radius: 14px; border: 1px solid #E2E8F0; overflow-x: auto; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
    .m3-table { width: 100%; border-collapse: collapse; font-size: 13px; }
    .m3-table th { background: #F8FAFC; color: #475569; font-weight: 700; text-align: left; padding: 14px 16px; border-bottom: 2px solid #E2E8F0; }
    .m3-table td { padding: 14px 16px; border-bottom: 1px solid #F1F5F9; vertical-align: middle; }
    .user-row-info { display: flex; align-items: center; gap: 10px; }
    .avatar { width: 32px; height: 32px; border-radius: 50%; }
    .user-name { font-weight: 700; color: #0F172A; }
    .status-badge { font-size: 10px; font-weight: 800; padding: 2px 8px; border-radius: 6px; background: #F1F5F9; color: #64748B; }
    .status-badge.active { background: #DCFCE7; color: #15803D; }
    .perm-tags { display: flex; flex-wrap: wrap; gap: 4px; }
    .perm-chip { font-size: 10px; font-weight: 700; background: #EFF6FF; color: #2563EB; padding: 2px 6px; border-radius: 4px; }
  `]
})
export class UsersComponent {
  public authService = inject(AuthService);
}
