import { Injectable, inject } from '@angular/core';
import { ToastController } from '@ionic/angular/standalone';
import { getErrorMessage } from './error-message';

@Injectable({ providedIn: 'root' })
export class NotificationsService {
  private readonly toastController = inject(ToastController);

  success(message: string): Promise<void> {
    return this.present(message, 'success');
  }

  error(error: unknown, fallback: string): Promise<void> {
    return this.present(getErrorMessage(error, fallback), 'danger', 3200);
  }

  info(message: string): Promise<void> {
    return this.present(message);
  }

  private async present(message: string, color?: string, duration = 2200): Promise<void> {
    const toast = await this.toastController.create({
      message,
      color,
      duration,
      position: 'top',
      cssClass: 'docshelf-toast',
      buttons: [{ text: 'Dismiss', role: 'cancel' }],
    });
    await toast.present();
  }
}
