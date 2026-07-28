import { TestBed } from '@angular/core/testing';
import { PwaNotificationService } from './pwa-notification.service';
import { RequestStoreService } from './request-store.service';
import { NotificationService } from './notification.service';

describe('PwaNotificationService - Notificaciones y PWA', () => {
  let service: PwaNotificationService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        PwaNotificationService,
        RequestStoreService,
        NotificationService
      ]
    });
    service = TestBed.inject(PwaNotificationService);
  });

  it('debe crearse e inicializar señales de instalación PWA', () => {
    expect(service).toBeTruthy();
    expect(service.canInstall()).toBeFalse();
  });

  it('debe calcular la programación del temporizador a las 9:00 AM sin lanzar excepciones', () => {
    expect(() => service.schedule9AmReminder()).not.toThrow();
  });

  it('debe enviar notificaciones de prueba de forma segura', () => {
    expect(() => service.triggerImmediateTestNotification()).not.toThrow();
  });
});
