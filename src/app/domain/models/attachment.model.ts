export type DocumentType = 'Respuesta' | 'Oficio' | 'Anexo' | 'Identificacion' | 'General';

export interface AttachmentItem {
  idAdjunto: string;
  idSolicitud: string;
  nombreArchivo: string;
  tipoDocumento: DocumentType;
  formatoExt: string;
  driveUrl: string;
  driveFileId?: string;
  tamanioBytes?: number;
  fechaSubida: string;
  usuarioSubida: string;
}
