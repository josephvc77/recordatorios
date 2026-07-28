import { Injectable } from '@angular/core';
import { RequestItem } from '../../domain/models/request.model';
import { AppConfig, DueRuleConfig, StatusConfig } from '../../domain/models/config.model';

@Injectable({
  providedIn: 'root'
})
export class RuleEngineService {

  evaluateRequest(request: RequestItem, config: AppConfig): RequestItem {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let dueDate = new Date();
    if (request.fechaVencimiento && request.fechaVencimiento.trim().length >= 10) {
      const parsed = new Date(request.fechaVencimiento);
      if (!isNaN(parsed.getTime())) {
        dueDate = parsed;
      }
    }
    dueDate.setHours(0, 0, 0, 0);

    let daysRemaining = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (request.fechaTermino && request.fechaTermino.trim().length >= 10) {
      const termDate = new Date(request.fechaTermino);
      if (!isNaN(termDate.getTime())) {
        termDate.setHours(0, 0, 0, 0);
        daysRemaining = Math.ceil((dueDate.getTime() - termDate.getTime()) / (1000 * 60 * 60 * 24));
      }
    }

    const statusConfig = config.statuses.find(s => s.id === request.estatusId) || {
      id: request.estatusId || 'EST-ANA',
      nombre: request.estatusId || 'ANALIZAR',
      colorHex: '#6B7280',
      orden: 99
    };

    const matchedRule = this.matchDueRule(daysRemaining, config.dueRules);

    let visualColor = statusConfig.colorHex;
    let overrideColor = false;
    let badgeMsg = '';
    let alertIcon = false;
    let priorityName = 'NORMAL';

    if (matchedRule) {
      priorityName = matchedRule.prioridadNombre;
      badgeMsg = (matchedRule.mensajeAlerta || '').replace('{X}', Math.abs(daysRemaining).toString());
      alertIcon = matchedRule.mostrarIcono;
      overrideColor = matchedRule.sobrescribirColor;

      if (overrideColor) {
        visualColor = matchedRule.colorHex;
      }
    }

    const hasObs = !!(request.observaciones && request.observaciones.trim().length > 0);

    return {
      ...request,
      diasRestantes: daysRemaining,
      priorityKey: priorityName,
      priorityLabel: priorityName,
      visualColorHex: visualColor,
      badgeMessage: badgeMsg,
      showAlertIcon: alertIcon,
      overrideStatusColor: overrideColor,
      hasObservations: hasObs
    };
  }

  private matchDueRule(daysRemaining: number, dueRules: DueRuleConfig[]): DueRuleConfig | null {
    if (!dueRules || dueRules.length === 0) return null;

    const sorted = [...dueRules].sort((a, b) => a.diasUmbral - b.diasUmbral);

    if (daysRemaining < 0) {
      return sorted.find(r => r.diasUmbral < 0) || sorted[0];
    }

    for (const rule of sorted) {
      if (rule.diasUmbral >= 0 && daysRemaining <= rule.diasUmbral) {
        return rule;
      }
    }

    return sorted.find(r => r.diasUmbral > 5) || null;
  }
}
