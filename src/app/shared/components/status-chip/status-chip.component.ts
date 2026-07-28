import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfigService } from '../../../core/services/config.service';

@Component({
  selector: 'app-status-chip',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span 
      class="status-chip" 
      [style.background-color]="color"
      [style.color]="textColor">
      {{ label }}
    </span>
  `,
  styles: [`
    .status-chip {
      display: inline-flex;
      align-items: center;
      padding: 4px 10px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      box-shadow: 0 1px 3px rgba(0,0,0,0.12);
      white-space: nowrap;
      transition: transform 0.15s ease;
    }
    .status-chip:hover {
      transform: scale(1.03);
    }
  `]
})
export class StatusChipComponent {
  private configService = inject(ConfigService);

  @Input({ required: true }) statusId!: string;

  get statusConfig() {
    return this.configService.getStatusById(this.statusId);
  }

  get label(): string {
    return this.statusConfig?.nombre || this.statusId;
  }

  get color(): string {
    return this.statusConfig?.colorHex || '#6B7280';
  }

  get textColor(): string {
    // Determinar contraste automáticamente
    const hex = this.color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16) || 0;
    const g = parseInt(hex.substring(2, 4), 16) || 0;
    const b = parseInt(hex.substring(4, 6), 16) || 0;
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 145 ? '#1F2937' : '#FFFFFF';
  }
}
