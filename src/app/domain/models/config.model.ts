export interface StatusConfig {
  id: string;
  nombre: string;
  colorHex: string;
  orden: number;
}

export interface DueRuleConfig {
  id: string;
  diasUmbral: number;        // e.g. 5, 4, 3, 2, 1, 0, -1
  prioridadNombre: string;   // e.g. "Seguimiento", "Advertencia", "CRÍTICO", "Vencido"
  colorHex: string;          // HEX color code
  mensajeAlerta: string;     // e.g. "Llamar al área", "Vencido hace {X} días"
  mostrarIcono: boolean;
  sobrescribirColor: boolean;
}

export interface AreaConfig {
  id: string;
  nombre: string;
  responsable?: string;
}

export interface RequestTypeConfig {
  id: string;
  nombre: string;
  descripcion?: string;
}

export interface TagConfig {
  id: string;
  nombre: string;
  colorHex: string;
}

export interface AppConfig {
  statuses: StatusConfig[];
  dueRules: DueRuleConfig[];
  areas: AreaConfig[];
  types: RequestTypeConfig[];
  tags: TagConfig[];
}
