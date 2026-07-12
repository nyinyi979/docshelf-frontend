import { Component, computed, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import {
  IonButton,
  IonButtons,
  IonChip,
  IonContent,
  IonHeader,
  IonIcon,
  IonModal,
  IonTextarea,
  IonTitle,
  IonToggle,
  IonToolbar,
  ToastController,
} from '@ionic/angular/standalone';
import { versionHistory } from '../../data/mocks';
import { DocumentStoreService } from '../../services/document-store.service';

@Component({
  selector: 'app-document-details-page',
  standalone: true,
  imports: [
    FormsModule,
    RouterLink,
    IonButton,
    IonButtons,
    IonChip,
    IonContent,
    IonHeader,
    IonIcon,
    IonModal,
    IonTextarea,
    IonTitle,
    IonToggle,
    IonToolbar,
  ],
  templateUrl: './document-details.page.html',
  styleUrl: './document-details.page.scss',
})
export class DocumentDetailsPage {
  private readonly route = inject(ActivatedRoute);
  readonly store = inject(DocumentStoreService);
  private readonly toastController = inject(ToastController);

  readonly id = toSignal(this.route.paramMap.pipe(map((params) => params.get('id') ?? '')), {
    initialValue: this.route.snapshot.paramMap.get('id') ?? '',
  });
  readonly doc = computed(() => this.store.findById(this.id()));
  readonly related = computed(() => {
    const document = this.doc();
    if (!document) return [];
    return this.store
      .documents()
      .filter((item) => item.category === document.category && item.id !== document.id)
      .slice(0, 3);
  });

  readonly versionHistory = versionHistory;
  readonly bookmarked = computed(() => Boolean(this.doc()?.bookmarked));
  readonly isPublic = signal(false);
  readonly previewPage = signal(1);
  readonly totalPreviewPages = 8;
  readonly versionModalOpen = signal(false);
  versionNotes = '';
  newVersionFile: File | null = null;

  constructor() {
    effect(() => this.isPublic.set(this.doc()?.isPublic ?? false));
  }

  movePreview(direction: number): void {
    this.previewPage.update((page) =>
      Math.min(this.totalPreviewPages, Math.max(1, page + direction)),
    );
  }

  toggleBookmark(): void {
    const document = this.doc();
    if (document) this.store.toggleBookmark(document.id);
  }

  async download(): Promise<void> {
    await this.presentToast('Download started');
  }

  async share(): Promise<void> {
    const document = this.doc();
    if (!document) return;
    const url = `${window.location.origin}/documents/${document.id}`;
    try {
      await navigator.clipboard?.writeText(url);
      await this.presentToast('Share link copied to clipboard');
    } catch {
      await this.presentToast(url);
    }
  }

  onVersionFile(event: Event): void {
    this.newVersionFile = (event.target as HTMLInputElement).files?.[0] ?? null;
  }

  async uploadVersion(): Promise<void> {
    if (!this.newVersionFile) return;
    this.versionModalOpen.set(false);
    this.newVersionFile = null;
    this.versionNotes = '';
    await this.presentToast('New version uploaded');
  }

  private async presentToast(message: string): Promise<void> {
    const toast = await this.toastController.create({ message, duration: 1800, position: 'bottom' });
    await toast.present();
  }
}
