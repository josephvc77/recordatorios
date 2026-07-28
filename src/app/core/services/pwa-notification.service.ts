import { Injectable, signal, inject } from '@angular/core';
import { RequestStoreService } from './request-store.service';
import { NotificationService } from './notification.service';

@Injectable({
  providedIn: 'root'
})
export class PwaNotificationService {
  private store = inject(RequestStoreService);
  private notificationService = inject(NotificationService);

  public deferredPrompt = signal<any>(null);
  public canInstall = signal<boolean>(false);
  public notificationPermission = signal<NotificationPermission>('default');

  private timerId: any = null;

  constructor() {
    this.initPwa();
    this.checkNotificationPermission();
    this.schedule9AmReminder();
  }

  private initPwa() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then(
          (reg) => console.log('✅ Service Worker registrado con éxito:', reg.scope),
          (err) => console.warn('⚠️ Error al registrar Service Worker:', err)
        );
      });
    }

    window.addEventListener('beforeinstallprompt', (e: Event) => {
      e.preventDefault();
      this.deferredPrompt.set(e);
      this.canInstall.set(true);
    });

    window.addEventListener('appinstalled', () => {
      this.canInstall.set(false);
      this.deferredPrompt.set(null);
      this.notificationService.showSuccess('¡Aplicación instalada exitosamente!');
    });
  }

  public async installPwa() {
    const promptEvent = this.deferredPrompt();
    if (!promptEvent) return;

    promptEvent.prompt();
    const choice = await promptEvent.userChoice;
    if (choice.outcome === 'accepted') {
      this.notificationService.showSuccess('Instalando aplicación...');
    }
    this.deferredPrompt.set(null);
    this.canInstall.set(false);
  }

  public async requestNotificationPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      this.notificationService.showError('Este navegador no soporta notificaciones de escritorio.');
      return false;
    }

    const perm = await Notification.requestPermission();
    this.notificationPermission.set(perm);

    if (perm === 'granted') {
      this.notificationService.showSuccess('🔔 Notificaciones de las 9:00 AM activadas.');
      this.triggerImmediateTestNotification('Notificaciones Activadas', 'Recibirás un aviso diario a las 9:00 AM con el estado de tus solicitudes.');
      return true;
    } else {
      this.notificationService.showError('Permiso de notificaciones denegado.');
      return false;
    }
  }

  private checkNotificationPermission() {
    if ('Notification' in window) {
      this.notificationPermission.set(Notification.permission);
    }
  }

  /**
   * Programa la alarma diaria para ejecutarse a las 9:00 AM de cada día
   */
  public schedule9AmReminder() {
    if (this.timerId) clearTimeout(this.timerId);

    const now = new Date();
    const target9Am = new Date();
    target9Am.setHours(9, 0, 0, 0);

    // Si ya pasaron las 9:00 AM del día de hoy, programar para mañana a las 9:00 AM
    if (now.getTime() >= target9Am.getTime()) {
      target9Am.setDate(target9Am.getDate() + 1);
    }

    const msUntil9Am = target9Am.getTime() - now.getTime();
    console.log(`⏰ Próximo recordatorio de las 9:00 AM programado en ${Math.round(msUntil9Am / 1000 / 60)} minutos.`);

    this.timerId = setTimeout(() => {
      this.checkAndSend9AmNotification();
      // Repetir automáticamente cada 24 horas (86,400,000 ms)
      setInterval(() => this.checkAndSend9AmNotification(), 86400000);
    }, msUntil9Am);
  }

  /**
   * Evalúa solicitudes vencidas, críticas o urgentes y envía la notificación de las 9:00 AM
   */
  public checkAndSend9AmNotification() {
    const evaluated = this.store.evaluatedRequests();
    const urgentItems = evaluated.filter(r => 
      r.priorityKey === 'CRÍTICO' || 
      r.priorityKey === 'URGENTE' || 
      r.priorityKey === 'Vence Hoy' || 
      r.priorityKey === 'Vencido'
    );

    const count = urgentItems.length;
    const title = count > 0 
      ? `🚨 Recordatorio 9:00 AM: ${count} solicitud(es) requieren atención hoy`
      : `☀️ Recordatorio 9:00 AM: Todas tus solicitudes están en tiempo`;

    const body = count > 0
      ? `Tienes ${count} expedientes próximos a vencer o vencidos. Haz clic para revisar en el Dashboard.`
      : `No hay solicitudes en riesgo crítico el día de hoy. ¡Excelente trabajo!`;

    this.sendWebNotification(title, body, count);
  }

  public triggerImmediateTestNotification(customTitle?: string, customBody?: string) {
    const evaluated = this.store.evaluatedRequests();
    const urgentItems = evaluated.filter(r => 
      r.priorityKey === 'CRÍTICO' || 
      r.priorityKey === 'URGENTE' || 
      r.priorityKey === 'Vence Hoy' || 
      r.priorityKey === 'Vencido'
    );

    const title = customTitle || `🚨 Notificación de Prueba (9:00 AM)`;
    const body = customBody || `Tienes ${urgentItems.length} solicitud(es) que requieren atención o vencen próximamente.`;
    this.sendWebNotification(title, body, urgentItems.length);
  }

  private sendWebNotification(title: string, body: string, count: number) {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'TRIGGER_NOTIFICATION',
        title,
        body,
        count
      });
    } else if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: '/favicon.ico',
        tag: 'daily-reminder-9am'
      });
    }
  }
}
