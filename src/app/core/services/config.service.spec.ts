import { TestBed } from '@angular/core/testing';
import { ConfigService } from './config.service';

describe('ConfigService - Gestión de Catálogos y Configuración', () => {
  let service: ConfigService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ConfigService]
    });
    service = TestBed.inject(ConfigService);
  });

  it('debe crearse e inicializarse con los catálogos por defecto', () => {
    expect(service).toBeTruthy();
    const config = service.config();
    expect(config.statuses.length).toBeGreaterThan(0);
    expect(config.areas.length).toBeGreaterThan(0);
    expect(config.dueRules.length).toBeGreaterThan(0);
  });

  it('debe buscar correctamente un estatus por su ID', () => {
    const status = service.getStatusById('EST-ANA');
    expect(status).toBeTruthy();
    expect(status?.nombre).toBe('ANALIZAR');
  });

  it('debe buscar correctamente un área por su ID', () => {
    const area = service.getAreaById('INGER');
    expect(area).toBeTruthy();
    expect(area?.nombre).toBe('INGER');
  });

  it('debe permitir actualizar parcialmente la configuración mediante setConfig', () => {
    service.setConfig({
      areas: [
        { id: 'NUEVA_AREA', nombre: 'Nueva Área Test', responsable: 'Jefe Test' }
      ]
    });

    const config = service.config();
    expect(config.areas.length).toBe(1);
    expect(config.areas[0].id).toBe('NUEVA_AREA');
    expect(config.statuses.length).toBeGreaterThan(0);
  });
});
