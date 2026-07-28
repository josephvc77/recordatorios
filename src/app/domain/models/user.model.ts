export type PermissionKey =
  | 'ver_dashboard'
  | 'ver_solicitudes'
  | 'crear_solicitud'
  | 'editar_solicitud'
  | 'cambiar_estatus'
  | 'subir_adjuntos'
  | 'eliminar_solicitud'
  | 'ver_reportes'
  | 'administrar_configuracion'
  | 'gestionar_usuarios'
  | 'ADMIN'
  | '*';

export interface UserItem {
  idUsuario: string;
  email: string;
  nombre: string;
  fotoUrl?: string;
  permisos: PermissionKey[];
  ultimoAcceso?: string;
  activo: boolean;
}
