import { Component, inject, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  IonButton,
  IonButtons,
  IonChip,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonPopover,
  ToastController,
} from '@ionic/angular/standalone';
import { ShelfDocument } from '../../models/document.model';

@Component({
  selector: 'app-document-card',
  standalone: true,
  imports: [
    RouterLink,
    IonButton,
    IonButtons,
    IonChip,
    IonIcon,
    IonItem,
    IonLabel,
    IonList,
    IonPopover,
  ],
  templateUrl: './document-card.component.html',
  styleUrl: './document-card.component.scss',
})
export class DocumentCardComponent {
  private readonly toastController = inject(ToastController);

  readonly doc = input.required<ShelfDocument>();
  readonly mode = input<'card' | 'row'>('card');
  readonly bookmarkToggle = output<string>();
  readonly deleteRequested = output<string>();

  get iconName(): string {
    const type = this.doc().fileType;
    if (type === 'xlsx') return 'spreadsheet-outline';
    if (type === 'doc') return 'document-outline';
    return 'document-attach-outline';
  }

  get menuId(): string {
    return `document-menu-${this.mode()}-${this.doc().id}`;
  }

  async download(): Promise<void> {
    await this.presentToast('Download started');
  }

  async share(): Promise<void> {
    const url = `${window.location.origin}/documents/${this.doc().id}`;
    try {
      await navigator.clipboard?.writeText(url);
      await this.presentToast('Share link copied');
    } catch {
      await this.presentToast(url);
    }
  }

  private async presentToast(message: string): Promise<void> {
    const toast = await this.toastController.create({ message, duration: 1700, position: 'bottom' });
    await toast.present();
  }
}
