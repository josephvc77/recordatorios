import { Injectable } from '@angular/core';
import { RequestItem } from '../../domain/models/request.model';
import { HistoryEntry } from '../../domain/models/history.model';
import { AttachmentItem } from '../../domain/models/attachment.model';

export interface ApiResponse<T> {
  success?: boolean;
  error?: string;
  message?: string;
  data?: T;
  id?: string;
  version?: number;
  timestamp?: string;
  requests?: RequestItem[];
  requestTags?: any[];
  history?: HistoryEntry[];
  attachments?: AttachmentItem[];
  users?: any[];
  statusCatalog?: any[];
  dueRulesCatalog?: any[];
  areasCatalog?: any[];
  typesCatalog?: any[];
  tagsCatalog?: any[];
  attachment?: AttachmentItem;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  // Nueva URL oficial del Web App desplegado en Google Apps Script (v4.8)
  private gasScriptUrl = 'https://script.google.com/macros/s/AKfycbwW2PLSgj3-RKizJjZaYWTJgA5Lp_ndYfAsJ9-YVrYyiZVFFVQ8RMjzSIENpfU6eWs/exec'; 

  public setScriptUrl(url: string) {
    this.gasScriptUrl = url;
  }

  public getScriptUrl(): string {
    return this.gasScriptUrl;
  }

  async fetchInitialData(userEmail: string): Promise<ApiResponse<any>> {
    if (!this.gasScriptUrl) {
      return { success: true, ...this.getEmptyData() };
    }
    try {
      const url = `${this.gasScriptUrl}?resource=init&userEmail=${encodeURIComponent(userEmail)}`;
      const res = await fetch(url, { method: 'GET', redirect: 'follow' });
      return await res.json();
    } catch (err) {
      console.warn('⚠️ Google Apps Script no respondió. Inicializando con lista limpia.', err);
      return { success: true, ...this.getEmptyData() };
    }
  }

  async fetchDeltas(sinceIso: string): Promise<ApiResponse<any>> {
    if (!this.gasScriptUrl) {
      return { success: true, requests: [], timestamp: new Date().toISOString() };
    }
    try {
      const url = `${this.gasScriptUrl}?resource=requests&action=read&since=${encodeURIComponent(sinceIso)}`;
      const res = await fetch(url, { method: 'GET', redirect: 'follow' });
      return await res.json();
    } catch (err) {
      return { error: 'OFFLINE', message: 'No se pudo conectar a la API.' };
    }
  }

  async createRequest(payload: Partial<RequestItem>, userEmail: string): Promise<ApiResponse<any>> {
    if (!this.gasScriptUrl) {
      const newId = crypto.randomUUID();
      return { success: true, id: newId, version: 1, timestamp: new Date().toISOString() };
    }
    return this.postRequest('requests', 'create', payload, userEmail);
  }

  async updateRequest(payload: Partial<RequestItem>, userEmail: string): Promise<ApiResponse<any>> {
    if (!this.gasScriptUrl) {
      return { success: true, id: payload.id, version: (payload.version || 1) + 1, timestamp: new Date().toISOString() };
    }
    return this.postRequest('requests', 'update', payload, userEmail);
  }

  async changeStatus(id: string, newStatusId: string, isFinalStatus: boolean, userEmail: string): Promise<ApiResponse<any>> {
    if (!this.gasScriptUrl) {
      return { success: true, id, version: 2, timestamp: new Date().toISOString() };
    }
    return this.postRequest('requests', 'changeStatus', { id, newStatusId, isFinalStatus }, userEmail);
  }

  async deleteRequest(id: string, userEmail: string): Promise<ApiResponse<any>> {
    if (!this.gasScriptUrl) {
      return { success: true, id };
    }
    return this.postRequest('requests', 'delete', { id }, userEmail);
  }

  async uploadDriveFile(idSolicitud: string, file: File, tipoDocumento: string, userEmail: string): Promise<ApiResponse<any>> {
    const base64 = await this.fileToBase64(file);
    const payload = {
      idSolicitud,
      fileName: file.name,
      contentType: file.type,
      sizeBytes: file.size,
      base64Data: base64,
      tipoDocumento
    };

    if (!this.gasScriptUrl) {
      const mockAttachment: AttachmentItem = {
        idAdjunto: crypto.randomUUID(),
        idSolicitud,
        nombreArchivo: file.name,
        tipoDocumento: tipoDocumento as any,
        formatoExt: file.name.split('.').pop() || 'pdf',
        driveUrl: 'https://drive.google.com/file/d/1A2B3C_mock_link/view',
        driveFileId: 'mock_123',
        tamanioBytes: file.size,
        fechaSubida: new Date().toISOString(),
        usuarioSubida: userEmail
      };
      return { success: true, attachment: mockAttachment };
    }

    return this.postRequest('attachments', 'upload', payload, userEmail);
  }

  public async postRequest(resource: string, action: string, bodyData: any, userEmail: string): Promise<ApiResponse<any>> {
    try {
      const url = `${this.gasScriptUrl}?resource=${resource}&action=${action}&userEmail=${encodeURIComponent(userEmail)}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(bodyData),
        redirect: 'follow'
      });
      return await res.json();
    } catch (err) {
      console.error('API Error:', err);
      return { error: 'NETWORK_ERROR', message: 'Fallo de red al comunicarse con Google Apps Script.' };
    }
  }

  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = error => reject(error);
    });
  }

  private getEmptyData() {
    return {
      requests: [],
      history: [],
      attachments: [],
      timestamp: new Date().toISOString()
    };
  }
}
