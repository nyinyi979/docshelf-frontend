import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { IonButton, IonInput, ToastController } from '@ionic/angular/standalone';
import { getErrorMessage } from '../../../../shared/error-message';
import { AuthService } from '../../api';
import { AuthLayoutComponent } from '../auth-layout/auth-layout.component';

@Component({
  selector: 'app-register-page',
  standalone: true,
  imports: [FormsModule, RouterLink, IonButton, IonInput, AuthLayoutComponent],
  templateUrl: './register.page.html',
  styleUrl: './register.page.scss',
})
export class RegisterPage {
  private readonly router = inject(Router);
  private readonly toastController = inject(ToastController);
  private readonly auth = inject(AuthService);

  name = '';
  email = '';
  password = '';
  confirm = '';

  async submit(): Promise<void> {
    if (this.password !== this.confirm) {
      const toast = await this.toastController.create({
        message: "Passwords don't match",
        color: 'danger',
        duration: 1800,
        position: 'bottom',
      });
      await toast.present();
      return;
    }

    try {
      await this.auth.register({
        username: this.name,
        email: this.email,
        password: this.password,
      });
      const toast = await this.toastController.create({
        message: 'Account created. You can now sign in.',
        duration: 1700,
        position: 'bottom',
      });
      await toast.present();
      await this.router.navigateByUrl('/login');
    } catch (error) {
      const toast = await this.toastController.create({
        message: getErrorMessage(error, 'Registration failed'),
        color: 'danger',
        duration: 2000,
      });
      await toast.present();
    }
  }
}
