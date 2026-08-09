import { Component, computed, effect, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {
  AlertController,
  IonButton,
  IonChip,
  IonContent,
  IonInput,
  ToastController,
} from '@ionic/angular/standalone';
import { getErrorMessage } from '../../../../shared/error-message';
import { AuthService } from '../../api';

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [FormsModule, IonButton, IonChip, IonContent, IonInput],
  templateUrl: './profile.page.html',
  styleUrl: './profile.page.scss',
})
export class ProfilePage {
  private readonly toastController = inject(ToastController);
  private readonly alertController = inject(AlertController);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly currentUser = computed(() => {
    const user = this.auth.user();
    const name = user?.username ?? '';
    return {
      name,
      email: user?.email ?? '',
      role: user?.role ?? 'member',
      initials: name
        .split(/\s+/)
        .map((part) => part[0])
        .join('')
        .slice(0, 2)
        .toUpperCase(),
    };
  });
  name = '';
  currentPassword = '';
  newPassword = '';
  confirmPassword = '';

  constructor() {
    void this.auth.loadCurrentUser();
    effect(() => {
      const username = this.auth.user()?.username;
      if (username && !this.name) this.name = username;
    });
  }

  async save(): Promise<void> {
    if (this.newPassword && this.newPassword !== this.confirmPassword) {
      await this.presentToast("New passwords don't match", 'danger');
      return;
    }
    try {
      await this.auth.updateProfile({
        username: this.name,
        ...(this.newPassword
          ? {
              currentPassword: this.currentPassword,
              newPassword: this.newPassword,
            }
          : {}),
      });
      this.currentPassword = '';
      this.newPassword = '';
      this.confirmPassword = '';
      await this.presentToast('Profile updated');
    } catch (error) {
      await this.presentToast(getErrorMessage(error, 'Profile update failed'), 'danger');
    }
  }

  async confirmDelete(): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Delete your account?',
      message: 'This action is permanent. All your documents and bookmarks will be removed.',
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Delete',
          role: 'destructive',
          handler: async (value: { password?: string }) => {
            try {
              await this.auth.deleteAccount(value.password ?? '');
              await this.presentToast('Account deleted');
              await this.router.navigateByUrl('/login');
            } catch (error) {
              await this.presentToast(getErrorMessage(error, 'Account deletion failed'), 'danger');
            }
          },
        },
      ],
      inputs: [
        {
          name: 'password',
          type: 'password',
          placeholder: 'Confirm your password',
        },
      ],
    });
    await alert.present();
  }

  private async presentToast(message: string, color?: string): Promise<void> {
    const toast = await this.toastController.create({
      message,
      color,
      duration: 1900,
      position: 'bottom',
    });
    await toast.present();
  }
}
