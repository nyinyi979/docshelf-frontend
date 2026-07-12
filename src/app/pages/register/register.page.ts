import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { IonButton, IonInput, ToastController } from '@ionic/angular/standalone';
import { AuthLayoutComponent } from '../../components/auth-layout/auth-layout.component';

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

    const toast = await this.toastController.create({
      message: 'Account created',
      duration: 1500,
      position: 'bottom',
    });
    await toast.present();
    await this.router.navigateByUrl('/');
  }
}
