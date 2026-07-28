export interface HistoryEntry {
  idHistorial: string;
  idSolicitud: string;
  fechaHora: string;        // ISO 8601
  usuario: string;
  modulo: string;           // 'Solicitudes', 'Kanban', 'Calendario', 'Configuracion'
  origen: string;           // 'TablaPrincipal', 'KanbanDragDrop', 'ModalFormulario'
  tipoAccion: string;       // 'CREACION', 'EDICION', 'CAMBIO_ESTATUS', 'ADJUNTO', 'ELIMINACION'
  campo: string;
  valorAnterior: string;
  valorNuevo: string;
}
