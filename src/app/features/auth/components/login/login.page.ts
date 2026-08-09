import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { IonButton, IonInput, ToastController } from '@ionic/angular/standalone';
import { getErrorMessage } from '../../../../shared/error-message';
import { AuthService } from '../../api';
import { AuthLayoutComponent } from '../auth-layout/auth-layout.component';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [FormsModule, RouterLink, IonButton, IonInput, AuthLayoutComponent],
  templateUrl: './login.page.html',
  styleUrl: './login.page.scss',
})
export class LoginPage {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  readonly auth = inject(AuthService);
  private readonly toastController = inject(ToastController);

  email = '';
  password = '';

  async submit(): Promise<void> {
    try {
      await this.auth.login({ email: this.email, password: this.password });
      const toast = await this.toastController.create({
        message: 'Signed in',
        duration: 1400,
        position: 'bottom',
      });
      await toast.present();
      await this.router.navigateByUrl(this.route.snapshot.queryParamMap.get('returnUrl') || '/');
    } catch (error) {
      const toast = await this.toastController.create({
        message: getErrorMessage(error, 'Sign in failed'),
        color: 'danger',
        duration: 2000,
      });
      await toast.present();
    }
  }
}
