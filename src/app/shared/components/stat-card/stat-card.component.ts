import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="stat-card" [style.border-left-color]="accentColor">
      <div class="stat-header">
        <span class="stat-title">{{ title }}</span>
        @if (icon) {
          <span class="stat-icon">{{ icon }}</span>
        }
      </div>
      <div class="stat-value" [style.color]="accentColor">{{ value }}</div>
      @if (subtitle) {
        <div class="stat-subtitle">{{ subtitle }}</div>
      }
    </div>
  `,
  styles: [`
    .stat-card {
      background: var(--card-bg, #ffffff);
      border-radius: 12px;
      padding: 16px 20px;
      border-left: 5px solid #3B82F6;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
      transition: transform 0.2s ease, box-shadow 0.2s ease;
      cursor: pointer;
    }
    .stat-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
    }
    .stat-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }
    .stat-title {
      font-size: 13px;
      font-weight: 600;
      color: var(--text-muted, #6B7280);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .stat-icon {
      font-size: 18px;
    }
    .stat-value {
      font-size: 28px;
      font-weight: 800;
      line-height: 1.1;
    }
    .stat-subtitle {
      margin-top: 6px;
      font-size: 12px;
      color: var(--text-muted, #9CA3AF);
    }
  `]
})
export class StatCardComponent {
  @Input({ required: true }) title!: string;
  @Input({ required: true }) value!: string | number;
  @Input() subtitle?: string;
  @Input() icon?: string;
  @Input() accentColor = '#3B82F6';
}
