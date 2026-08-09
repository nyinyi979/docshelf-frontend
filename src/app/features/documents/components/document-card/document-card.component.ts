import { Component, inject, input, output, signal } from '@angular/core';
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
  IonSpinner,
  ToastController,
} from '@ionic/angular/standalone';
import { getErrorMessage } from '../../../../shared/error-message';
import { FileAccessService } from '../../file-access.service';
import { ShelfDocument } from '../../types';

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
    IonSpinner,
  ],
  templateUrl: './document-card.component.html',
  styleUrl: './document-card.component.scss',
})
export class DocumentCardComponent {
  private readonly toastController = inject(ToastController);
  private readonly fileAccess = inject(FileAccessService);

  readonly doc = input.required<ShelfDocument>();
  readonly mode = input<'card' | 'row'>('card');
  readonly canDelete = input(false);
  readonly bookmarkPending = input(false);
  readonly deletePending = input(false);
  readonly bookmarkToggle = output<string>();
  readonly deleteRequested = output<string>();
  readonly downloading = signal(false);
  readonly sharing = signal(false);

  get iconName(): string {
    const type = this.doc().fileType;
    if (type === 'xlsx') return 'grid-outline';
    if (type === 'doc') return 'document-outline';
    return 'document-attach-outline';
  }

  get menuId(): string {
    return `document-menu-${this.mode()}-${this.doc().id}`;
  }

  async download(): Promise<void> {
    if (this.downloading()) return;
    this.downloading.set(true);
    try {
      await this.fileAccess.open(this.doc().id);
    } catch (error) {
      await this.presentToast(getErrorMessage(error, 'Unable to open file'));
    } finally {
      this.downloading.set(false);
    }
  }

  async share(): Promise<void> {
    if (this.sharing()) return;
    this.sharing.set(true);
    const url = `${window.location.origin}/documents/${this.doc().id}`;
    try {
      await navigator.clipboard?.writeText(url);
      await this.presentToast('Share link copied');
    } catch {
      await this.presentToast(url);
    } finally {
      this.sharing.set(false);
    }
  }

  private async presentToast(message: string): Promise<void> {
    const toast = await this.toastController.create({
      message,
      duration: 1700,
      position: 'bottom',
    });
    await toast.present();
  }
}
