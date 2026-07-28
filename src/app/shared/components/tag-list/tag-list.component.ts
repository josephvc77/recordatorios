import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfigService } from '../../../core/services/config.service';

@Component({
  selector: 'app-tag-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="tag-container">
      @for (tagId of tags; track tagId) {
        @let tagConfig = getTagConfig(tagId);
        @if (tagConfig) {
          <span 
            class="tag-item" 
            [style.background-color]="tagConfig.colorHex + '22'" 
            [style.color]="tagConfig.colorHex"
            [style.border-color]="tagConfig.colorHex">
            # {{ tagConfig.nombre }}
          </span>
        }
      }
    </div>
  `,
  styles: [`
    .tag-container {
      display: inline-flex;
      flex-wrap: wrap;
      gap: 4px;
    }
    .tag-item {
      font-size: 11px;
      font-weight: 600;
      padding: 2px 8px;
      border-radius: 8px;
      border: 1px solid currentColor;
      white-space: nowrap;
    }
  `]
})
export class TagListComponent {
  private configService = inject(ConfigService);

  @Input() tags: string[] = [];

  getTagConfig(tagId: string) {
    return this.configService.config().tags.find(t => t.id === tagId);
  }
}
