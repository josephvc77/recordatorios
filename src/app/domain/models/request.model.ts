export interface RequestItem {
  id: string;
  folio: string;
  solicitud: string;
  areaId: string;
  tema: string;
  tipoId: string;
  ipDp?: string;             // Campo IP/DP
  fechaEntrada: string;       // YYYY-MM-DD
  fechaVencimiento: string;   // YYYY-MM-DD
  fechaTermino?: string | null;
  estatusId: string;
  observaciones?: string;
  tags?: string[];
  usuarioCreacion?: string;
  ultimaModificacion?: string;
  version?: number;
  eliminado?: boolean;

  // Propiedades Dinámicas Evaluadas por RuleEngineService
  diasRestantes?: number;
  priorityKey?: string;
  priorityLabel?: string;
  visualColorHex?: string;
  badgeMessage?: string;
  showAlertIcon?: boolean;
  overrideStatusColor?: boolean;
  hasObservations?: boolean;
}
