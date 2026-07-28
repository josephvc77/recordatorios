import { Injectable, signal, computed, inject } from '@angular/core';
import { RequestItem } from '../../domain/models/request.model';
import { HistoryEntry } from '../../domain/models/history.model';
import { AttachmentItem } from '../../domain/models/attachment.model';
import { RuleEngineService } from './rule-engine.service';
import { ConfigService } from './config.service';
import { CacheService } from './cache.service';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';

export interface FilterState {
  searchQuery: string;
  areaId: string;
  statusId: string;
  priorityKey: string;
  typeId: string;
  tagId: string;
  dateRange: { start?: string; end?: string };
}

@Injectable({
  providedIn: 'root'
})
export class RequestStoreService {
  private ruleEngine = inject(RuleEngineService);
  private configService = inject(ConfigService);
  private cacheService = inject(CacheService);
  private apiService = inject(ApiService);
  private authService = inject(AuthService);

  // Core State Signals
  public readonly rawRequests = signal<RequestItem[]>([]);
  public readonly history = signal<HistoryEntry[]>([]);
  public readonly attachments = signal<AttachmentItem[]>([]);
  public readonly isLoading = signal<boolean>(true);
  public readonly lastSyncTime = signal<string | null>(null);

  // Filter State Signal
  public readonly filterState = signal<FilterState>({
    searchQuery: '',
    areaId: 'ALL',
    statusId: 'ALL',
    priorityKey: 'ALL',
    typeId: 'ALL',
    tagId: 'ALL',
    dateRange: {}
  });

  // COMPUTED SIGNALS
  public readonly evaluatedRequests = computed(() => {
    const raw = this.rawRequests().filter(r => !r.eliminado);
    const config = this.configService.config();
    return raw.map(r => this.ruleEngine.evaluateRequest(r, config));
  });

  public readonly filteredRequests = computed(() => {
    const list = this.evaluatedRequests();
    const filters = this.filterState();

    return list.filter(item => {
      if (filters.searchQuery && filters.searchQuery.trim() !== '') {
        const q = filters.searchQuery.toLowerCase().trim();
        const matchFolio = (item.folio || '').toLowerCase().includes(q);
        const matchSolicitud = (item.solicitud || '').toLowerCase().includes(q);
        const matchTema = (item.tema || '').toLowerCase().includes(q);
        const matchIpDp = (item.ipDp || '').toLowerCase().includes(q);
        const matchObs = item.observaciones ? item.observaciones.toLowerCase().includes(q) : false;
        if (!matchFolio && !matchSolicitud && !matchTema && !matchIpDp && !matchObs) return false;
      }

      if (filters.areaId !== 'ALL' && item.areaId !== filters.areaId) return false;
      if (filters.statusId !== 'ALL' && item.estatusId !== filters.statusId) return false;
      if (filters.priorityKey !== 'ALL' && item.priorityKey !== filters.priorityKey) return false;
      if (filters.typeId !== 'ALL' && item.tipoId !== filters.typeId) return false;

      if (filters.tagId !== 'ALL') {
        if (!item.tags || !item.tags.includes(filters.tagId)) return false;
      }

      return true;
    });
  });

  public readonly metrics = computed(() => {
    const all = this.evaluatedRequests();
    const total = all.length;

    let pendientes = 0;
    let terminadas = 0;
    let urgentes = 0;
    let criticas = 0;
    let vencenHoy = 0;
    let vencidas = 0;
    let conObservaciones = 0;

    const porEstatus: { [key: string]: number } = {};
    const porArea: { [key: string]: number } = {};

    all.forEach(item => {
      porEstatus[item.estatusId] = (porEstatus[item.estatusId] || 0) + 1;
      porArea[item.areaId] = (porArea[item.areaId] || 0) + 1;

      if (item.estatusId === 'EST-TER' || item.estatusId === 'EST-LIS') {
        terminadas++;
      } else if (item.estatusId !== 'EST-CAN') {
        pendientes++;
      }

      if (item.priorityKey === 'CRÍTICO' || item.priorityKey === 'CRITICO') criticas++;
      if (item.priorityKey === 'URGENTE') urgentes++;
      if (item.priorityKey === 'Vence Hoy' || item.priorityKey === 'VENCE_HOY') vencenHoy++;
      if (item.priorityKey === 'Vencido' || item.priorityKey === 'VENCIDO') vencidas++;
      if (item.hasObservations) conObservaciones++;
    });

    return {
      total,
      pendientes,
      terminadas,
      urgentes,
      criticas,
      vencenHoy,
      vencidas,
      conObservaciones,
      porEstatus,
      porArea
    };
  });

  public readonly activeAlerts = computed(() => {
    const list = this.evaluatedRequests().filter(r => r.estatusId !== 'EST-TER' && r.estatusId !== 'EST-CAN');
    
    const criticas = list.filter(r => r.priorityKey === 'CRÍTICO' || r.priorityKey === 'CRITICO');
    const venceHoy = list.filter(r => r.priorityKey === 'Vence Hoy' || r.priorityKey === 'VENCE_HOY');
    const urgentes = list.filter(r => r.priorityKey === 'URGENTE');
    const proximas = list.filter(r => r.priorityKey === 'Advertencia' || r.priorityKey === 'Importante');

    const result: { type: string; count: number; message: string; color: string }[] = [];

    if (criticas.length > 0) {
      result.push({ type: 'CRITICA', count: criticas.length, message: `${criticas.length} solicitudes requieren llamar al área inmediatamente`, color: '#DC2626' });
    }
    if (venceHoy.length > 0) {
      result.push({ type: 'VENCE_HOY', count: venceHoy.length, message: `${venceHoy.length} solicitudes vencen el día de hoy`, color: '#991B1B' });
    }
    if (urgentes.length > 0) {
      result.push({ type: 'URGENTE', count: urgentes.length, message: `${urgentes.length} solicitudes urgentes (vencen en 2 días)`, color: '#EF4444' });
    }
    if (proximas.length > 0) {
      result.push({ type: 'PROXIMAS', count: proximas.length, message: `${proximas.length} solicitudes próximas a vencer`, color: '#EAB308' });
    }

    return result;
  });

  constructor() {
    this.initStore();
  }

  /**
   * Normalización robusta para mapear campos de Google Sheets (TitleCase) a camelCase
   */
  private normalizeRequest(r: any): RequestItem {
    if (!r) return r;

    const formatDate = (val: any): string => {
      if (!val) return '';
      const str = val.toString().trim();
      if (str.length >= 10 && str.includes('-')) {
        return str.substring(0, 10);
      }
      try {
        const d = new Date(str);
        if (!isNaN(d.getTime())) {
          return d.toISOString().substring(0, 10);
        }
      } catch (e) {}
      return str;
    };

    return {
      id: r.id || r.Id || '',
      folio: r.folio || r.Folio || '',
      solicitud: r.solicitud || r.Solicitud || '',
      areaId: r.areaId || r.AreaId || 'AREA-FIN',
      tema: r.tema || r.Tema || '',
      tipoId: r.tipoId || r.TipoId || 'TIPO-GEN',
      ipDp: r.ipDp || r.IpDp || r['IP / DP'] || 'IP',
      fechaEntrada: formatDate(r.fechaEntrada || r.FechaEntrada) || new Date().toISOString().substring(0, 10),
      fechaVencimiento: formatDate(r.fechaVencimiento || r.FechaVencimiento) || new Date().toISOString().substring(0, 10),
      fechaTermino: formatDate(r.fechaTermino || r.FechaTermino) || null,
      estatusId: r.estatusId || r.EstatusId || 'EST-ANA',
      observaciones: r.observaciones || r.Observaciones || '',
      tags: Array.isArray(r.tags) ? r.tags : (r.Tags ? r.Tags.toString().split(',') : []),
      usuarioCreacion: r.usuarioCreacion || r.UsuarioCreacion || '',
      ultimaModificacion: r.ultimaModificacion || r.UltimaModificacion || '',
      version: Number(r.version || r.Version) || 1,
      eliminado: r.eliminado === true || r.Eliminado === true || r.Eliminado === 'TRUE' || r.Eliminado === 'true'
    };
  }

  private async initStore() {
    this.isLoading.set(true);

    try {
      // 1. Cargar desde IndexedDB para pantalla ultra rápida
      const cachedRequests = await this.cacheService.getAll<any>('solicitudes');
      const cachedHistory = await this.cacheService.getAll<HistoryEntry>('historial');
      const cachedAttachments = await this.cacheService.getAll<AttachmentItem>('adjuntos');

      if (cachedRequests.length > 0) {
        const normalized = cachedRequests.map(r => this.normalizeRequest(r));
        this.rawRequests.set(normalized);
        this.history.set(cachedHistory);
        this.attachments.set(cachedAttachments);
        this.isLoading.set(false);
      }

      // 2. Sincronizar en segundo plano con Google Apps Script API
      const userEmail = this.authService.currentUser().email;
      const apiData = await this.apiService.fetchInitialData(userEmail);

      if (apiData.requests && Array.isArray(apiData.requests)) {
        const normalized = apiData.requests.map(r => this.normalizeRequest(r));
        this.rawRequests.set(normalized);
        await this.cacheService.setItems('solicitudes', normalized);
      }

      if (apiData.history && Array.isArray(apiData.history)) {
        this.history.set(apiData.history);
        await this.cacheService.setItems('historial', apiData.history);
      }

      if (apiData.attachments && Array.isArray(apiData.attachments)) {
        this.attachments.set(apiData.attachments);
        await this.cacheService.setItems('adjuntos', apiData.attachments);
      }

      this.lastSyncTime.set(new Date().toLocaleTimeString());

    } catch (err) {
      console.error('Error al inicializar Store:', err);
    } finally {
      this.isLoading.set(false);
    }
  }

  public updateFilters(partial: Partial<FilterState>) {
    this.filterState.update(curr => ({ ...curr, ...partial }));
  }

  public resetFilters() {
    this.filterState.set({
      searchQuery: '',
      areaId: 'ALL',
      statusId: 'ALL',
      priorityKey: 'ALL',
      typeId: 'ALL',
      tagId: 'ALL',
      dateRange: {}
    });
  }

  async createRequest(req: Partial<RequestItem>): Promise<boolean> {
    this.isLoading.set(true);
    const userEmail = this.authService.currentUser().email;
    
    const res = await this.apiService.createRequest(req, userEmail);
    if (res.success && res.id) {
      const newRequest: RequestItem = this.normalizeRequest({
        id: res.id,
        folio: req.folio || `FOL-${Math.floor(1000 + Math.random() * 9000)}`,
        solicitud: req.solicitud || '',
        areaId: req.areaId || 'AREA-FIN',
        tema: req.tema || '',
        tipoId: req.tipoId || 'TIPO-GEN',
        ipDp: req.ipDp || 'IP',
        fechaEntrada: req.fechaEntrada || new Date().toISOString().substring(0, 10),
        fechaVencimiento: req.fechaVencimiento || new Date().toISOString().substring(0, 10),
        fechaTermino: req.fechaTermino || null,
        estatusId: req.estatusId || 'EST-ANA',
        observaciones: req.observaciones || '',
        tags: req.tags || [],
        usuarioCreacion: userEmail,
        version: res.version || 1,
        eliminado: false
      });

      const newHistory: HistoryEntry = {
        idHistorial: crypto.randomUUID(),
        idSolicitud: res.id,
        fechaHora: new Date().toISOString(),
        usuario: userEmail,
        modulo: 'Solicitudes',
        origen: 'ModalFormulario',
        tipoAccion: 'CREACION',
        campo: 'Registro',
        valorAnterior: 'Ninguno',
        valorNuevo: `Solicitud Creada (${newRequest.folio})`
      };

      this.rawRequests.update(list => [newRequest, ...list]);
      this.history.update(h => [newHistory, ...h]);

      await this.cacheService.setItem('solicitudes', newRequest);
      await this.cacheService.setItem('historial', newHistory);
      this.isLoading.set(false);
      return true;
    }

    this.isLoading.set(false);
    return false;
  }

  async updateRequest(req: Partial<RequestItem>, modulo = 'Solicitudes', origen = 'ModalFormulario'): Promise<boolean> {
    this.isLoading.set(true);
    const userEmail = this.authService.currentUser().email;
    
    const res = await this.apiService.updateRequest(req, userEmail);
    if (res.success && req.id) {
      this.rawRequests.update(list => list.map(item => {
        if (item.id === req.id) {
          return this.normalizeRequest({ ...item, ...req, version: res.version || (item.version || 1) + 1 });
        }
        return item;
      }));

      const newHistory: HistoryEntry = {
        idHistorial: crypto.randomUUID(),
        idSolicitud: req.id,
        fechaHora: new Date().toISOString(),
        usuario: userEmail,
        modulo,
        origen,
        tipoAccion: 'EDICION',
        campo: 'Datos Solicitud',
        valorAnterior: 'Varios',
        valorNuevo: 'Solicitud Modificada'
      };

      this.history.update(h => [newHistory, ...h]);
      const updatedItem = this.rawRequests().find(r => r.id === req.id);
      if (updatedItem) await this.cacheService.setItem('solicitudes', updatedItem);
      await this.cacheService.setItem('historial', newHistory);

      this.isLoading.set(false);
      return true;
    }

    this.isLoading.set(false);
    return false;
  }

  async changeStatus(id: string, newStatusId: string, modulo = 'Solicitudes', origen = 'TablaPrincipal'): Promise<boolean> {
    const currentItem = this.rawRequests().find(r => r.id === id);
    if (!currentItem) return false;

    this.isLoading.set(true);
    const userEmail = this.authService.currentUser().email;
    const isFinal = newStatusId === 'EST-TER' || newStatusId === 'EST-LIS';

    const res = await this.apiService.changeStatus(id, newStatusId, isFinal, userEmail);
    if (res.success) {
      const oldStatus = currentItem.estatusId;

      this.rawRequests.update(list => list.map(item => {
        if (item.id === id) {
          return this.normalizeRequest({
            ...item,
            estatusId: newStatusId,
            fechaTermino: isFinal ? (item.fechaTermino || new Date().toISOString().substring(0, 10)) : item.fechaTermino,
            version: res.version || (item.version || 1) + 1
          });
        }
        return item;
      }));

      const newHistory: HistoryEntry = {
        idHistorial: crypto.randomUUID(),
        idSolicitud: id,
        fechaHora: new Date().toISOString(),
        usuario: userEmail,
        modulo,
        origen,
        tipoAccion: 'CAMBIO_ESTATUS',
        campo: 'Estatus',
        valorAnterior: oldStatus,
        valorNuevo: newStatusId
      };

      this.history.update(h => [newHistory, ...h]);
      const updatedItem = this.rawRequests().find(r => r.id === id);
      if (updatedItem) await this.cacheService.setItem('solicitudes', updatedItem);
      await this.cacheService.setItem('historial', newHistory);

      this.isLoading.set(false);
      return true;
    }

    this.isLoading.set(false);
    return false;
  }

  async deleteRequest(id: string): Promise<boolean> {
    this.isLoading.set(true);
    const userEmail = this.authService.currentUser().email;

    const res = await this.apiService.deleteRequest(id, userEmail);
    if (res.success) {
      this.rawRequests.update(list => list.filter(item => item.id !== id));
      this.isLoading.set(false);
      return true;
    }

    this.isLoading.set(false);
    return false;
  }

  async uploadAttachment(idSolicitud: string, file: File, tipoDocumento: string): Promise<boolean> {
    this.isLoading.set(true);
    const userEmail = this.authService.currentUser().email;

    const res = await this.apiService.uploadDriveFile(idSolicitud, file, tipoDocumento, userEmail);
    if (res.success && res.attachment) {
      this.attachments.update(att => [res.attachment!, ...att]);
      await this.cacheService.setItem('adjuntos', res.attachment);
      this.isLoading.set(false);
      return true;
    }

    this.isLoading.set(false);
    return false;
  }
}
