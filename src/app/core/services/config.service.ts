import { Injectable, signal } from '@angular/core';
import { AppConfig, StatusConfig, DueRuleConfig, AreaConfig, RequestTypeConfig, TagConfig } from '../../domain/models/config.model';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  public readonly config = signal<AppConfig>(this.getDefaultConfig());

  public setConfig(newConfig: Partial<AppConfig>) {
    this.config.update(curr => ({ ...curr, ...newConfig }));
  }

  public getStatusById(id: string): StatusConfig | undefined {
    return this.config().statuses.find(s => s.id === id);
  }

  public getAreaById(id: string): AreaConfig | undefined {
    return this.config().areas.find(a => a.id === id);
  }

  public getTypeById(id: string): RequestTypeConfig | undefined {
    return this.config().types.find(t => t.id === id);
  }

  private getDefaultConfig(): AppConfig {
    return {
      statuses: [
        { id: 'EST-ANA', nombre: 'ANALIZAR', colorHex: '#FFD54F', orden: 1 },
        { id: 'EST-ESP', nombre: 'ESPERANDO RESPUESTA', colorHex: '#EC4899', orden: 2 },
        { id: 'EST-LIS', nombre: 'LISTO', colorHex: '#3B82F6', orden: 3 },
        { id: 'EST-ENV', nombre: 'POR ENVIAR', colorHex: '#8B5CF6', orden: 4 },
        { id: 'EST-COM', nombre: 'A COMITÉ', colorHex: '#F59E0B', orden: 5 },
        { id: 'EST-PRO', nombre: 'PRÓRROGA', colorHex: '#10B981', orden: 6 },
        { id: 'EST-TER', nombre: 'TERMINADA', colorHex: '#059669', orden: 7 },
        { id: 'EST-CAN', nombre: 'CANCELADA', colorHex: '#94A3B8', orden: 8 }
      ],
      dueRules: [
        { id: 'RULE-NORMAL', diasUmbral: 999, prioridadNombre: 'NORMAL', colorHex: '#6B7280', mensajeAlerta: 'En tiempo (>5 días)', mostrarIcono: false, sobrescribirColor: false },
        { id: 'RULE-5D', diasUmbral: 5, prioridadNombre: 'Seguimiento', colorHex: '#3B82F6', mensajeAlerta: 'Vence en 5 días', mostrarIcono: false, sobrescribirColor: false },
        { id: 'RULE-4D', diasUmbral: 4, prioridadNombre: 'Advertencia', colorHex: '#F59E0B', mensajeAlerta: 'Próximo a vencer (4 días)', mostrarIcono: false, sobrescribirColor: false },
        { id: 'RULE-3D', diasUmbral: 3, prioridadNombre: 'Importante', colorHex: '#F97316', mensajeAlerta: 'Importante (3 días restantes)', mostrarIcono: false, sobrescribirColor: true },
        { id: 'RULE-2D', diasUmbral: 2, prioridadNombre: 'URGENTE', colorHex: '#EF4444', mensajeAlerta: '⚠️ URGENTE (2 días restantes)', mostrarIcono: true, sobrescribirColor: true },
        { id: 'RULE-1D', diasUmbral: 1, prioridadNombre: 'CRÍTICO', colorHex: '#DC2626', mensajeAlerta: '🚨 CRÍTICO (1 día restantes - Llamar al área)', mostrarIcono: true, sobrescribirColor: true },
        { id: 'RULE-0D', diasUmbral: 0, prioridadNombre: 'Vence Hoy', colorHex: '#991B1B', mensajeAlerta: '🔴 VENCE HOY', mostrarIcono: true, sobrescribirColor: true },
        { id: 'RULE-NEG', diasUmbral: -1, prioridadNombre: 'Vencido', colorHex: '#450A0A', mensajeAlerta: '⚫ VENCIDO', mostrarIcono: true, sobrescribirColor: true }
      ],
      areas: [
        { id: 'INGER', nombre: 'INGER', responsable: 'Dirección INGER' },
        { id: 'CONASAMA', nombre: 'CONASAMA', responsable: 'Dirección CONASAMA' },
        { id: 'DGRHO', nombre: 'DGRHO', responsable: 'Recursos Humanos' },
        { id: 'UT SHARNY', nombre: 'UT SHARNY', responsable: 'Unidad Transparencia' },
        { id: 'DGRMYNS', nombre: 'DGRMYNS', responsable: 'Materiales y Servicios' },
        { id: 'CNEGSSR', nombre: 'CNEGSSR', responsable: 'CNEGSSR' },
        { id: 'FINANZAS', nombre: 'Finanzas', responsable: 'Dirección Financiera' },
        { id: 'JURIDICO', nombre: 'Jurídico', responsable: 'Dirección Jurídica' },
        { id: 'GENERAL', nombre: 'General', responsable: 'Mesa General' }
      ],
      types: [
        { id: 'TIPO-GEN', nombre: 'General', descripcion: 'Solicitudes Generales' },
        { id: 'TIPO-PRE', nombre: 'Presupuesto', descripcion: 'Solicitud de Presupuesto' },
        { id: 'TIPO-LIC', nombre: 'Licenciamiento', descripcion: 'Licencias y Contratos' },
        { id: 'TIPO-AUD', nombre: 'Auditoría', descripcion: 'Revisiones de Auditoría' }
      ],
      tags: [
        { id: 'TAG-URG', nombre: 'Urgente', colorHex: '#EF4444' },
        { id: 'TAG-PRE', nombre: 'Presupuesto', colorHex: '#10B981' },
        { id: 'TAG-VIP', nombre: 'VIP', colorHex: '#8B5CF6' }
      ]
    };
  }
}
