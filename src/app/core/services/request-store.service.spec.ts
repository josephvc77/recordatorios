import { TestBed } from '@angular/core/testing';
import { RequestStoreService } from './request-store.service';
import { ConfigService } from './config.service';
import { RuleEngineService } from './rule-engine.service';
import { CacheService } from './cache.service';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';

describe('RequestStoreService - Almacenamiento, Filtros y Métricas', () => {
  let store: RequestStoreService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        RequestStoreService,
        ConfigService,
        RuleEngineService,
        CacheService,
        ApiService,
        AuthService
      ]
    });
    store = TestBed.inject(RequestStoreService);
  });

  it('debe crearse correctamente e inicializar señales de métricas', () => {
    expect(store).toBeTruthy();
    expect(store.metrics().total).toBe(0);
  });

  it('debe normalizar correctamente objetos en formato Google Apps Script (TitleCase)', () => {
    const rawGasItem = {
      Id: 'gas-123',
      Folio: 'FOL-001',
      Solicitud: 'Solicitud desde Excel',
      AreaId: 'INGER',
      Tema: 'Tema de prueba',
      IpDp: 'DATOS PERSONALES',
      FechaEntrada: '2026-07-01',
      FechaVencimiento: '2026-07-30',
      EstatusId: 'EST-ANA'
    };

    const normalized = (store as any).normalizeRequest(rawGasItem);
    expect(normalized.id).toBe('gas-123');
    expect(normalized.folio).toBe('FOL-001');
    expect(normalized.solicitud).toBe('Solicitud desde Excel');
    expect(normalized.areaId).toBe('INGER');
    expect(normalized.ipDp).toBe('DATOS PERSONALES');
  });

  it('debe aplicar filtros por búsqueda de texto de forma precisa', () => {
    const mockItems = [
      { id: '1', folio: 'FOL-100', solicitud: 'Licencia de Software', tema: 'Sistemas', areaId: 'INGER', estatusId: 'EST-ANA', fechaVencimiento: '2026-08-01' },
      { id: '2', folio: 'FOL-200', solicitud: 'Compra de Mobiliario', tema: 'Recursos', areaId: 'DGRHO', estatusId: 'EST-TER', fechaVencimiento: '2026-08-05' }
    ];

    (store as any).rawRequests.set(mockItems);
    expect(store.filteredRequests().length).toBe(2);

    store.updateFilters({ searchQuery: 'Software' });
    expect(store.filteredRequests().length).toBe(1);
    expect(store.filteredRequests()[0].id).toBe('1');
  });

  it('debe reiniciar los filtros a su estado inicial', () => {
    store.updateFilters({ searchQuery: 'Test', areaId: 'INGER', statusId: 'EST-ANA' });
    store.resetFilters();
    expect(store.filterState().searchQuery).toBe('');
    expect(store.filterState().areaId).toBe('ALL');
    expect(store.filterState().statusId).toBe('ALL');
  });
});
