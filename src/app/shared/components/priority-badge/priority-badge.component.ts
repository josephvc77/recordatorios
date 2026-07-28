import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-priority-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span 
      class="priority-badge" 
      [style.background-color]="colorHex"
      [style.color]="textColor"
      [class.pulse-critical]="priorityKey === 'CRÍTICO' || priorityKey === 'CRITICO' || priorityKey === 'Vence Hoy'">
      @if (showAlertIcon) {
        <span class="icon">⚠️</span>
      }
      <span class="text">{{ message || priorityKey }}</span>
    </span>
  `,
  styles: [`
    .priority-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 4px 10px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.3px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.15);
      white-space: nowrap;
    }
    .icon {
      font-size: 12px;
    }
    .pulse-critical {
      animation: pulseAlert 1.8s infinite;
    }
    @keyframes pulseAlert {
      0% { box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.7); }
      70% { box-shadow: 0 0 0 8px rgba(220, 38, 38, 0); }
      100% { box-shadow: 0 0 0 0 rgba(220, 38, 38, 0); }
    }
  `]
})
export class PriorityBadgeComponent {
  @Input() priorityKey = 'NORMAL';
  @Input() message = '';
  @Input() colorHex = '#6B7280';
  @Input() showAlertIcon = false;

  get textColor(): string {
    const hex = (this.colorHex || '#6B7280').replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16) || 0;
    const g = parseInt(hex.substring(2, 4), 16) || 0;
    const b = parseInt(hex.substring(4, 6), 16) || 0;
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 145 ? '#1F2937' : '#FFFFFF';
  }
}
