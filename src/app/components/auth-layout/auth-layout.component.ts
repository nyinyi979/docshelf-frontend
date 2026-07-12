import { Component, inject, input } from '@angular/core';
import { IonIcon } from '@ionic/angular/standalone';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [IonIcon],
  templateUrl: './auth-layout.component.html',
  styleUrl: './auth-layout.component.scss',
})
export class AuthLayoutComponent {
  readonly title = input.required<string>();
  readonly subtitle = input.required<string>();
  readonly theme = inject(ThemeService);
}
