import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { IonButton, IonInput, ToastController } from '@ionic/angular/standalone';
import { AuthLayoutComponent } from '../../components/auth-layout/auth-layout.component';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [FormsModule, RouterLink, IonButton, IonInput, AuthLayoutComponent],
  templateUrl: './login.page.html',
  styleUrl: './login.page.scss',
})
export class LoginPage {
  private readonly router = inject(Router);
  private readonly toastController = inject(ToastController);

  email = '';
  password = '';

  async submit(): Promise<void> {
    const toast = await this.toastController.create({
      message: 'Signed in',
      duration: 1400,
      position: 'bottom',
    });
    await toast.present();
    await this.router.navigateByUrl('/');
  }
}
