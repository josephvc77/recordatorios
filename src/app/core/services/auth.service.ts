import { Injectable, signal } from '@angular/core';
import { UserItem, PermissionKey } from '../../domain/models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  public readonly currentUser = signal<UserItem>({
    idUsuario: 'usr-admin-01',
    email: 'admin.director@empresa.com',
    nombre: 'Director General (Admin)',
    fotoUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=AdminDirector',
    permisos: ['ADMIN', '*'],
    activo: true
  });

  public readonly availableUsers = signal<UserItem[]>([
    {
      idUsuario: 'usr-admin-01',
      email: 'admin.director@empresa.com',
      nombre: 'Director General (Admin)',
      fotoUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=AdminDirector',
      permisos: ['ADMIN', '*'],
      activo: true
    },
    {
      idUsuario: 'usr-operador-02',
      email: 'ana.operador@empresa.com',
      nombre: 'Ana Gómez (Operador)',
      fotoUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=AnaGomez',
      permisos: ['ver_dashboard', 'ver_solicitudes', 'crear_solicitud', 'editar_solicitud', 'cambiar_estatus', 'subir_adjuntos', 'ver_reportes'],
      activo: true
    },
    {
      idUsuario: 'usr-lector-03',
      email: 'carlos.lector@empresa.com',
      nombre: 'Carlos Ruiz (Lector)',
      fotoUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=CarlosRuiz',
      permisos: ['ver_dashboard', 'ver_solicitudes'],
      activo: true
    }
  ]);

  public switchUser(userId: string) {
    const user = this.availableUsers().find(u => u.idUsuario === userId);
    if (user) {
      this.currentUser.set(user);
    }
  }

  public hasPermission(permission: PermissionKey): boolean {
    const user = this.currentUser();
    if (!user || !user.activo) return false;
    if (user.permisos.includes('ADMIN') || user.permisos.includes('*')) return true;
    return user.permisos.includes(permission);
  }
}
