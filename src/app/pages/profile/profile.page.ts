import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  AlertController,
  IonButton,
  IonChip,
  IonContent,
  IonIcon,
  IonInput,
  ToastController,
} from '@ionic/angular/standalone';
import { currentUser } from '../../data/mocks';

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [FormsModule, IonButton, IonChip, IonContent, IonIcon, IonInput],
  templateUrl: './profile.page.html',
  styleUrl: './profile.page.scss',
})
export class ProfilePage {
  private readonly toastController = inject(ToastController);
  private readonly alertController = inject(AlertController);

  readonly currentUser = currentUser;
  name = currentUser.name;
  currentPassword = '';
  newPassword = '';
  confirmPassword = '';

  async save(): Promise<void> {
    const toast = await this.toastController.create({
      message: 'Profile updated',
      duration: 1800,
      position: 'bottom',
    });
    await toast.present();
  }

  async choosePhoto(): Promise<void> {
    const toast = await this.toastController.create({
      message: 'Photo picker is ready for a Capacitor Camera integration.',
      duration: 2200,
      position: 'bottom',
    });
    await toast.present();
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
          handler: async () => {
            const toast = await this.toastController.create({
              message: 'Account deleted',
              duration: 1800,
              position: 'bottom',
            });
            await toast.present();
          },
        },
      ],
    });
    await alert.present();
  }
}
