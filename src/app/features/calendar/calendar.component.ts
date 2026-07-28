import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { RequestStoreService } from '../../core/services/request-store.service';
import { ConfigService } from '../../core/services/config.service';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="calendar-page">
      <div class="page-header">
        <div>
          <h1 class="page-title">Calendario de Vencimientos</h1>
          <p class="page-subtitle">Programación visual por fechas límite de atención</p>
        </div>

        <div class="header-controls">
          <div class="month-nav">
            <button class="nav-btn" (click)="changeMonth(-1)">◀</button>
            <span class="month-label">{{ currentMonthName() }} {{ currentYear() }}</span>
            <button class="nav-btn" (click)="changeMonth(1)">▶</button>
          </div>

          <div class="view-toggle">
            <button [class.active]="viewMode() === 'month'" (click)="viewMode.set('month')">Mes</button>
            <button [class.active]="viewMode() === 'agenda'" (click)="viewMode.set('agenda')">Agenda</button>
          </div>
        </div>
      </div>

      <!-- VISTA MES -->
      @if (viewMode() === 'month') {
        <div class="calendar-grid">
          <div class="day-name">DOM</div>
          <div class="day-name">LUN</div>
          <div class="day-name">MAR</div>
          <div class="day-name">MIÉ</div>
          <div class="day-name">JUE</div>
          <div class="day-name">VIE</div>
          <div class="day-name">SÁB</div>

          @for (cell of monthGrid(); track cell.dateIso) {
            <div class="calendar-cell" [class.other-month]="!cell.inMonth">
              <div class="cell-top">
                <span class="cell-day-num">{{ cell.dayNum }}</span>
                <span class="cell-date-fmt">{{ cell.dateFmt }}</span>
              </div>
              <div class="cell-events">
                @for (evt of cell.events; track evt.id) {
                  <div 
                    class="event-pill" 
                    [style.background-color]="evt.visualColorHex"
                    (click)="openDetail(evt.id)">
                    <span class="event-folio">{{ evt.folio }}</span>
                    <span class="event-title">{{ evt.solicitud }}</span>
                  </div>
                }
              </div>
            </div>
          }
        </div>
      }

      <!-- VISTA AGENDA -->
      @if (viewMode() === 'agenda') {
        <div class="agenda-list">
          @for (evt of store.evaluatedRequests(); track evt.id) {
            <div class="agenda-card" (click)="openDetail(evt.id)">
              <div class="agenda-date">
                <span class="date-val">{{ formatDateDdMmYyyy(evt.fechaVencimiento) }}</span>
                <span class="badge" [style.background-color]="evt.visualColorHex">{{ evt.priorityKey }}</span>
              </div>
              <div class="agenda-content">
                <div class="agenda-folio">{{ evt.folio }}</div>
                <div class="agenda-title">{{ evt.solicitud }}</div>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .calendar-page {
      padding: 24px;
    }
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }
    .page-title {
      font-size: 24px;
      font-weight: 800;
      color: #0F172A;
      margin: 0 0 4px 0;
    }
    .page-subtitle {
      font-size: 14px;
      color: #64748B;
      margin: 0;
    }
    .header-controls {
      display: flex;
      gap: 16px;
      align-items: center;
    }
    .month-nav {
      display: flex;
      align-items: center;
      gap: 12px;
      background: #FFFFFF;
      padding: 6px 14px;
      border-radius: 10px;
      border: 1px solid #CBD5E1;
    }
    .month-label {
      font-size: 14px;
      font-weight: 800;
      color: #0F172A;
      min-width: 140px;
      text-align: center;
    }
    .nav-btn {
      background: transparent;
      border: none;
      font-size: 12px;
      cursor: pointer;
      color: #475569;
    }
    .view-toggle {
      display: flex;
      background: #E2E8F0;
      border-radius: 8px;
      padding: 2px;
    }
    .view-toggle button {
      border: none;
      padding: 6px 14px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 700;
      cursor: pointer;
      color: #475569;
      background: transparent;
    }
    .view-toggle button.active {
      background: #FFFFFF;
      color: #0F172A;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    .calendar-grid {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 1px;
      background: #CBD5E1;
      border-radius: 14px;
      overflow: hidden;
      border: 1px solid #CBD5E1;
    }
    .day-name {
      background: #F8FAFC;
      padding: 12px;
      text-align: center;
      font-size: 12px;
      font-weight: 800;
      color: #64748B;
    }
    .calendar-cell {
      background: #FFFFFF;
      min-height: 110px;
      padding: 8px;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .calendar-cell.other-month {
      background: #F8FAFC;
      opacity: 0.5;
    }
    .cell-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .cell-day-num {
      font-size: 13px;
      font-weight: 800;
      color: #0F172A;
    }
    .cell-date-fmt {
      font-size: 10px;
      font-weight: 700;
      color: #94A3B8;
    }
    .cell-events {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .event-pill {
      color: #FFFFFF;
      font-size: 10px;
      font-weight: 700;
      padding: 3px 6px;
      border-radius: 6px;
      cursor: pointer;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      box-shadow: 0 1px 2px rgba(0,0,0,0.1);
    }
    .event-folio {
      font-weight: 900;
      margin-right: 4px;
    }
    .agenda-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .agenda-card {
      background: #FFFFFF;
      border-radius: 12px;
      padding: 16px;
      display: flex;
      align-items: center;
      gap: 20px;
      border: 1px solid #E2E8F0;
      cursor: pointer;
    }
    .agenda-date {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      min-width: 110px;
    }
    .date-val {
      font-size: 14px;
      font-weight: 800;
      color: #0F172A;
    }
    .badge {
      color: #FFFFFF;
      font-size: 10px;
      font-weight: 700;
      padding: 2px 6px;
      border-radius: 4px;
    }
    .agenda-folio {
      font-size: 12px;
      font-weight: 800;
      color: #3B82F6;
    }
    .agenda-title {
      font-size: 15px;
      font-weight: 700;
      color: #0F172A;
    }
  `]
})
export class CalendarComponent {
  public store = inject(RequestStoreService);
  private router = inject(Router);

  public currentDate = signal<Date>(new Date());
  public viewMode = signal<'month' | 'agenda'>('month');

  get currentYear() {
    return () => this.currentDate().getFullYear();
  }

  get currentMonthName() {
    return () => this.currentDate().toLocaleString('es-ES', { month: 'long' }).toUpperCase();
  }

  get monthGrid() {
    return () => {
      const year = this.currentDate().getFullYear();
      const month = this.currentDate().getMonth();

      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);

      const startDayOfWeek = firstDay.getDay();
      const totalDays = lastDay.getDate();

      const cells: { dayNum: number; dateIso: string; dateFmt: string; inMonth: boolean; events: any[] }[] = [];

      // Días del mes anterior
      for (let i = startDayOfWeek - 1; i >= 0; i--) {
        const d = new Date(year, month, -i);
        const dateIso = d.toISOString().substring(0, 10);
        cells.push({ 
          dayNum: d.getDate(), 
          dateIso, 
          dateFmt: this.formatDateDdMmYyyy(dateIso), 
          inMonth: false, 
          events: [] 
        });
      }

      // Días del mes actual
      const requests = this.store.evaluatedRequests();
      for (let day = 1; day <= totalDays; day++) {
        const dateIso = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const dateFmt = `${String(day).padStart(2, '0')}/${String(month + 1).padStart(2, '0')}/${year}`;
        const dayEvents = requests.filter(r => r.fechaVencimiento === dateIso);
        cells.push({ dayNum: day, dateIso, dateFmt, inMonth: true, events: dayEvents });
      }

      return cells;
    };
  }

  formatDateDdMmYyyy(dateStr: string): string {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
  }

  changeMonth(delta: number) {
    const next = new Date(this.currentDate());
    next.setMonth(next.getMonth() + delta);
    this.currentDate.set(next);
  }

  openDetail(id: string) {
    this.router.navigate(['/requests', id]);
  }
}
