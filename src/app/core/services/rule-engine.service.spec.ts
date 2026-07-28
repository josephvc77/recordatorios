import { TestBed } from '@angular/core/testing';
import { RuleEngineService } from './rule-engine.service';
import { ConfigService } from './config.service';
import { RequestItem } from '../../domain/models/request.model';

describe('RuleEngineService - Motor de Vencimientos y Alertas', () => {
  let service: RuleEngineService;
  let configService: ConfigService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [RuleEngineService, ConfigService]
    });
    service = TestBed.inject(RuleEngineService);
    configService = TestBed.inject(ConfigService);
  });

  it('debe crearse correctamente', () => {
    expect(service).toBeTruthy();
  });

  it('debe calcular e identificar correctamente solicitudes que vencen en 1 día (CRÍTICO)', () => {
    const today = new Date();
    const tomorrow = new Date(today.getTime() + 1 * 86400000).toISOString().substring(0, 10);
    
    const req: Partial<RequestItem> = {
      id: 'test-1',
      solicitud: 'Solicitud urgente',
      fechaVencimiento: tomorrow,
      estatusId: 'EST-ANA'
    };

    const evaluated = service.evaluateRequest(req as RequestItem, configService.config());
    expect(evaluated.diasRestantes).toBe(1);
    expect(evaluated.priorityKey).toBe('CRÍTICO');
    expect(evaluated.showAlertIcon).toBeTrue();
  });

  it('debe identificar correctamente solicitudes que vencen en 2 días (URGENTE)', () => {
    const today = new Date();
    const in2days = new Date(today.getTime() + 2 * 86400000).toISOString().substring(0, 10);
    
    const req: Partial<RequestItem> = {
      id: 'test-2',
      solicitud: 'Solicitud importante',
      fechaVencimiento: in2days,
      estatusId: 'EST-ANA'
    };

    const evaluated = service.evaluateRequest(req as RequestItem, configService.config());
    expect(evaluated.diasRestantes).toBe(2);
    expect(evaluated.priorityKey).toBe('URGENTE');
  });

  it('debe manejar fechas malformadas o nulas de forma segura sin romper el sistema (Resiliencia)', () => {
    const req: Partial<RequestItem> = {
      id: 'test-bad',
      solicitud: 'Solicitud con fecha inválida',
      fechaVencimiento: 'FECHA_CORRUPTA',
      estatusId: 'EST-ANA'
    };

    expect(() => service.evaluateRequest(req as RequestItem, configService.config())).not.toThrow();
    const evaluated = service.evaluateRequest(req as RequestItem, configService.config());
    expect(evaluated.diasRestantes).toBeDefined();
  });
});
