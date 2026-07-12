import { Component, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  IonButton,
  IonButtons,
  IonChip,
  IonContent,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonModal,
  IonProgressBar,
  IonSelect,
  IonSelectOption,
  IonTextarea,
  IonTitle,
  IonToggle,
  IonToolbar,
  ToastController,
} from '@ionic/angular/standalone';
import { allTags, categories, currentUser } from '../../data/mocks';
import { DocumentStoreService } from '../../services/document-store.service';

@Component({
  selector: 'app-upload-modal',
  standalone: true,
  imports: [
    FormsModule,
    IonButton,
    IonButtons,
    IonChip,
    IonContent,
    IonHeader,
    IonIcon,
    IonInput,
    IonItem,
      IonModal,
    IonProgressBar,
    IonSelect,
    IonSelectOption,
    IonTextarea,
    IonTitle,
    IonToggle,
    IonToolbar,
  ],
  templateUrl: './upload-modal.component.html',
  styleUrl: './upload-modal.component.scss',
})
export class UploadModalComponent {
  private readonly store = inject(DocumentStoreService);
  private readonly toastController = inject(ToastController);

  readonly open = input(false);
  readonly closed = output<void>();
  readonly uploaded = output<void>();

  readonly categories = categories;
  readonly allTags = allTags;
  readonly file = signal<File | null>(null);
  readonly tags = signal<string[]>([]);
  readonly progress = signal<number | null>(null);
  readonly dragOver = signal(false);

  title = '';
  description = '';
  category = '';
  isPublic = false;

  onFileInput(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) this.selectFile(file);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.dragOver.set(false);
    const file = event.dataTransfer?.files?.[0];
    if (file) this.selectFile(file);
  }

  toggleTag(tag: string): void {
    this.tags.update((items) =>
      items.includes(tag) ? items.filter((item) => item !== tag) : [...items, tag],
    );
  }

  dismiss(): void {
    if (this.progress() !== null) return;
    this.reset();
    this.closed.emit();
  }

  upload(): void {
    const file = this.file();
    if (!file || !this.title.trim()) return;

    this.progress.set(0);
    const timer = window.setInterval(() => {
      const next = Math.min(100, (this.progress() ?? 0) + 12);
      this.progress.set(next);
      if (next === 100) {
        window.clearInterval(timer);
        window.setTimeout(async () => {
          this.store.addDocument({
            id: `${Date.now()}`,
            title: this.title.trim(),
            description: this.description.trim() || 'Newly uploaded document.',
            category: this.category || 'Uncategorized',
            tags: this.tags(),
            fileUrl: '#',
            fileType: this.fileType(file.name),
            fileSize: this.formatBytes(file.size),
            uploadedBy: currentUser.name,
            isPublic: this.isPublic,
            createdAt: new Date().toISOString().slice(0, 10),
            versionNumber: 1,
          });
          const toast = await this.toastController.create({
            message: 'Document uploaded',
            duration: 1800,
            position: 'bottom',
          });
          await toast.present();
          this.uploaded.emit();
          this.reset();
          this.closed.emit();
        }, 250);
      }
    }, 160);
  }

  private selectFile(file: File): void {
    this.file.set(file);
    if (!this.title) this.title = file.name.replace(/\.[^.]+$/, '');
  }

  private reset(): void {
    this.file.set(null);
    this.tags.set([]);
    this.progress.set(null);
    this.dragOver.set(false);
    this.title = '';
    this.description = '';
    this.category = '';
    this.isPublic = false;
  }

  private fileType(filename: string): 'pdf' | 'doc' | 'xlsx' | 'ppt' | 'img' {
    const ext = filename.split('.').pop()?.toLowerCase();
    if (ext === 'xlsx' || ext === 'xls') return 'xlsx';
    if (ext === 'doc' || ext === 'docx') return 'doc';
    if (ext === 'ppt' || ext === 'pptx') return 'ppt';
    if (['png', 'jpg', 'jpeg', 'webp'].includes(ext ?? '')) return 'img';
    return 'pdf';
  }

  private formatBytes(bytes: number): string {
    if (!bytes) return '0 KB';
    const units = ['B', 'KB', 'MB', 'GB'];
    const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
    const value = bytes / 1024 ** index;
    return `${value.toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
  }
}
