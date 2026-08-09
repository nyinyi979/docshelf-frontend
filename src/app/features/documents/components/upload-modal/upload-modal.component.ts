import { Component, computed, effect, inject, input, output, signal } from '@angular/core';
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
import {
  injectMutation,
  injectQuery,
  injectQueryClient,
} from '@tanstack/angular-query-experimental';
import { getErrorMessage } from '../../../../shared/error-message';
import { TaxonomyQueries } from '../../../taxonomy/queries';
import { DocumentsApi } from '../../api';
import { documentKeys } from '../../queries';
import { SettingsQueries } from '../../../settings/queries';

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
  private readonly api = inject(DocumentsApi);
  private readonly taxonomyQueries = inject(TaxonomyQueries);
  private readonly queryClient = injectQueryClient();
  private readonly toastController = inject(ToastController);
  private readonly settingsQueries = inject(SettingsQueries);

  readonly open = input(false);
  readonly closed = output<void>();
  readonly uploaded = output<void>();

  readonly categoriesQuery = injectQuery(() => this.taxonomyQueries.categories());
  readonly tagsQuery = injectQuery(() => this.taxonomyQueries.tags());
  readonly settingsQuery = injectQuery(() => this.settingsQueries.runtime());
  readonly settings = computed(() => this.settingsQuery.data()?.data);
  readonly maxFileSizeMb = computed(() => this.settings()?.storage.maxFileSizeMb ?? 25);
  readonly allowedExtensions = computed(() => this.settings()?.storage.allowedExtensions ?? []);
  readonly acceptedExtensions = computed(() =>
    this.allowedExtensions()
      .map((item) => `.${item.replace(/^\./, '')}`)
      .join(','),
  );
  readonly categories = () => this.categoriesQuery.data() ?? [];
  readonly allTags = () => this.tagsQuery.data() ?? [];
  readonly uploadMutation = injectMutation(() => ({
    mutationFn: (input: Parameters<DocumentsApi['uploadDocument']>[0]) =>
      this.api.uploadDocument(input),
    onSuccess: () => this.queryClient.invalidateQueries({ queryKey: documentKeys.all }),
  }));
  readonly file = signal<File | null>(null);
  readonly tags = signal<string[]>([]);
  readonly progress = signal<number | null>(null);
  readonly dragOver = signal(false);

  title = '';
  description = '';
  categoryId = '';
  isPublic = false;

  constructor() {
    effect(() => {
      if (this.open() && this.settings()) {
        this.isPublic = this.settings()?.general.defaultVisibility === 'public';
      }
    });
  }

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

  tagName(id: string): string {
    return this.allTags().find((tag) => tag.id === id)?.name ?? '';
  }

  dismiss(): void {
    if (this.progress() !== null) return;
    this.reset();
    this.closed.emit();
  }

  async upload(): Promise<void> {
    const file = this.file();
    if (!file || !this.title.trim() || !this.categoryId) return;

    this.progress.set(10);
    try {
      await this.uploadMutation.mutateAsync({
        file,
        title: this.title.trim(),
        description: this.description.trim(),
        categoryId: this.categoryId,
        tagIds: this.tags(),
        isPublic: this.isPublic,
      });
      this.progress.set(100);
      const toast = await this.toastController.create({
        message: 'Document uploaded',
        duration: 1800,
        position: 'bottom',
      });
      await toast.present();
      this.uploaded.emit();
      this.reset();
      this.closed.emit();
    } catch (error) {
      this.progress.set(null);
      const toast = await this.toastController.create({
        message: getErrorMessage(error, 'Upload failed'),
        color: 'danger',
        duration: 2200,
      });
      await toast.present();
    }
  }

  private selectFile(file: File): void {
    const extension = file.name.split('.').pop()?.toLowerCase() ?? '';
    const allowed = this.allowedExtensions().map((item) => item.replace(/^\./, '').toLowerCase());
    if (!allowed.includes(extension)) {
      void this.presentFileError(
        `Files with the .${extension || 'unknown'} extension are not allowed.`,
      );
      return;
    }
    if (file.size > this.maxFileSizeMb() * 1024 * 1024) {
      void this.presentFileError(`Files must be ${this.maxFileSizeMb()} MB or smaller.`);
      return;
    }

    this.file.set(file);
    if (!this.title) this.title = file.name.replace(/\.[^.]+$/, '');
  }

  private async presentFileError(message: string): Promise<void> {
    const toast = await this.toastController.create({ message, color: 'danger', duration: 2200 });
    await toast.present();
  }

  private reset(): void {
    this.file.set(null);
    this.tags.set([]);
    this.progress.set(null);
    this.dragOver.set(false);
    this.title = '';
    this.description = '';
    this.categoryId = '';
    this.isPublic = false;
  }
}
