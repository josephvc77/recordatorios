import { Injectable, signal, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  timestamp: Date;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private snackBar = inject(MatSnackBar);
  public readonly toasts = signal<ToastMessage[]>([]);

  showSuccess(message: string, duration = 4000) {
    this.snackBar.open(message, 'OK', {
      duration,
      panelClass: ['snackbar-success'],
      horizontalPosition: 'end',
      verticalPosition: 'bottom'
    });
    this.addToast('success', message);
  }

  showError(message: string, duration = 6000) {
    this.snackBar.open(message, 'CERRAR', {
      duration,
      panelClass: ['snackbar-error'],
      horizontalPosition: 'end',
      verticalPosition: 'bottom'
    });
    this.addToast('error', message);
  }

  showWarning(message: string, duration = 5000) {
    this.snackBar.open(message, 'ENTENDIDO', {
      duration,
      panelClass: ['snackbar-warning'],
      horizontalPosition: 'end',
      verticalPosition: 'bottom'
    });
    this.addToast('warning', message);
  }

  showInfo(message: string, duration = 4000) {
    this.snackBar.open(message, 'INFO', {
      duration,
      panelClass: ['snackbar-info'],
      horizontalPosition: 'end',
      verticalPosition: 'bottom'
    });
    this.addToast('info', message);
  }

  private addToast(type: 'success' | 'error' | 'warning' | 'info', message: string) {
    const newToast: ToastMessage = {
      id: crypto.randomUUID(),
      type,
      message,
      timestamp: new Date()
    };
    this.toasts.update(list => [newToast, ...list.slice(0, 10)]);
  }
}
