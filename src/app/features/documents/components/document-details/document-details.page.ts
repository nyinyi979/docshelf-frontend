import { Component, computed, effect, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import {
  IonButton,
  IonButtons,
  IonChip,
  IonContent,
  IonHeader,
  IonIcon,
  IonModal,
  IonSpinner,
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
import { map } from 'rxjs';
import { getErrorMessage } from '../../../../shared/error-message';
import { ActivityQueries } from '../../../activity/queries';
import { DocumentsApi } from '../../api';
import { FileAccessService } from '../../file-access.service';
import { documentKeys, DocumentQueries } from '../../queries';
import { SettingsQueries } from '../../../settings/queries';

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
    IonSpinner,
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
  private readonly api = inject(DocumentsApi);
  private readonly queries = inject(DocumentQueries);
  private readonly activityQueries = inject(ActivityQueries);
  private readonly fileAccess = inject(FileAccessService);
  private readonly toastController = inject(ToastController);
  private readonly queryClient = injectQueryClient();
  private readonly settingsQueries = inject(SettingsQueries);
  readonly settingsQuery = injectQuery(() => this.settingsQueries.runtime());
  readonly canUpload = computed(() =>
    Boolean(this.settingsQuery.data()?.data.permissions['upload']),
  );

  readonly id = toSignal(this.route.paramMap.pipe(map((params) => params.get('id') ?? '')), {
    initialValue: this.route.snapshot.paramMap.get('id') ?? '',
  });
  readonly detailQuery = injectQuery(() => this.queries.detail(this.id()));
  readonly relatedQuery = injectQuery(() =>
    this.queries.list({ page: 0, perPage: 100, sortBy: 'createdAt', orderBy: 'desc' }),
  );
  readonly activityQuery = injectQuery(() => this.activityQueries.mine());
  readonly doc = computed(() => this.detailQuery.data()?.data);
  readonly notFound = computed(() => {
    const error = this.detailQuery.error();
    return error instanceof HttpErrorResponse && error.status === 404;
  });
  readonly related = computed(() => {
    const document = this.doc();
    if (!document) return [];
    return (this.relatedQuery.data()?.data ?? [])
      .filter((item) => item.category === document.category && item.id !== document.id)
      .slice(0, 3);
  });
  readonly versionHistory = computed(() => this.doc()?.versions ?? []);
  readonly documentActivity = computed(() =>
    (this.activityQuery.data()?.data ?? [])
      .filter((item) => item.targetId === this.id())
      .map((item) => ({
        id: item.id,
        text: `${item.userName ?? 'A member'} ${item.description}`,
        time: new Date(item.timestamp).toLocaleString(),
      })),
  );
  readonly bookmarked = computed(() => Boolean(this.doc()?.bookmarked));
  readonly isPublic = signal(false);
  readonly versionModalOpen = signal(false);
  readonly downloadTarget = signal<string | null>(null);
  readonly sharing = signal(false);
  readonly bookmarkMutation = injectMutation(() => ({
    mutationFn: ({ id, bookmarked }: { id: string; bookmarked: boolean }) =>
      this.api.setBookmark(id, bookmarked),
    onSuccess: () => this.invalidateDocuments(),
  }));
  readonly versionMutation = injectMutation(() => ({
    mutationFn: ({ id, file }: { id: string; file: File }) => this.api.uploadVersionFile(id, file),
    onSuccess: () => this.invalidateDocuments(),
  }));
  readonly visibilityMutation = injectMutation(() => ({
    mutationFn: ({ id, isPublic }: { id: string; isPublic: boolean }) =>
      this.api.update(id, { visibility: isPublic ? 'public' : 'private' }),
    onSuccess: () => this.invalidateDocuments(),
  }));

  versionNotes = '';
  newVersionFile: File | null = null;

  constructor() {
    effect(() => this.isPublic.set(this.doc()?.isPublic ?? false));
  }

  toggleBookmark(): void {
    if (this.bookmarkMutation.isPending()) return;
    const document = this.doc();
    if (document) {
      this.bookmarkMutation.mutate({
        id: document.id,
        bookmarked: !document.bookmarked,
      });
    }
  }

  async download(versionId?: string): Promise<void> {
    const document = this.doc();
    if (!document || this.downloadTarget() !== null) return;
    this.downloadTarget.set(versionId ?? 'current');
    try {
      await this.fileAccess.open(document.id, versionId);
    } catch (error) {
      await this.presentToast(getErrorMessage(error, 'Unable to open file'));
    } finally {
      this.downloadTarget.set(null);
    }
  }

  isDownloading(versionId?: string): boolean {
    return this.downloadTarget() === (versionId ?? 'current');
  }

  async share(): Promise<void> {
    const document = this.doc();
    if (!document || this.sharing()) return;
    this.sharing.set(true);
    const url = `${window.location.origin}/documents/${document.id}`;
    try {
      await navigator.clipboard?.writeText(url);
      await this.presentToast('Share link copied to clipboard');
    } catch {
      await this.presentToast(url);
    } finally {
      this.sharing.set(false);
    }
  }

  onVersionFile(event: Event): void {
    this.newVersionFile = (event.target as HTMLInputElement).files?.[0] ?? null;
  }

  async uploadVersion(): Promise<void> {
    const document = this.doc();
    if (!this.newVersionFile || !document || this.versionMutation.isPending()) return;
    try {
      await this.versionMutation.mutateAsync({
        id: document.id,
        file: this.newVersionFile,
      });
      this.versionModalOpen.set(false);
      this.newVersionFile = null;
      this.versionNotes = '';
      await this.presentToast('New version uploaded');
    } catch (error) {
      await this.presentToast(getErrorMessage(error, 'Version upload failed'));
    }
  }

  async changeVisibility(isPublic: boolean): Promise<void> {
    const document = this.doc();
    if (!document || this.visibilityMutation.isPending()) return;
    this.isPublic.set(isPublic);
    try {
      await this.visibilityMutation.mutateAsync({ id: document.id, isPublic });
    } catch (error) {
      this.isPublic.set(!isPublic);
      await this.presentToast(getErrorMessage(error, 'Visibility update failed'));
    }
  }

  private invalidateDocuments(): Promise<void> {
    return this.queryClient.invalidateQueries({ queryKey: documentKeys.all });
  }

  private async presentToast(message: string): Promise<void> {
    const toast = await this.toastController.create({
      message,
      duration: 1800,
      position: 'bottom',
    });
    await toast.present();
  }
}
