import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  IonButton,
  IonContent,
  IonIcon,
  IonSearchbar,
  IonSelect,
  IonSelectOption,
  IonSpinner,
  ToastController,
} from '@ionic/angular/standalone';
import {
  injectMutation,
  injectQuery,
  injectQueryClient,
} from '@tanstack/angular-query-experimental';
import { TaxonomyQueries } from '../../../taxonomy/queries';
import { DocumentsApi } from '../../api';
import { documentKeys, DocumentQueries } from '../../queries';
import { DocumentCardComponent } from '../document-card/document-card.component';
import { UploadModalComponent } from '../upload-modal/upload-modal.component';
import { getErrorMessage } from '../../../../shared/error-message';
import { SettingsQueries } from '../../../settings/queries';
import { AuthService } from '../../../auth/api';
import { ShelfDocument } from '../../types';

@Component({
  selector: 'app-documents-page',
  standalone: true,
  imports: [
    FormsModule,
    IonButton,
    IonContent,
    IonIcon,
    IonSearchbar,
    IonSelect,
    IonSelectOption,
    IonSpinner,
    DocumentCardComponent,
    UploadModalComponent,
  ],
  templateUrl: './documents.page.html',
  styleUrl: './documents.page.scss',
})
export class DocumentsPage {
  private readonly toastController = inject(ToastController);
  private readonly api = inject(DocumentsApi);
  private readonly queries = inject(DocumentQueries);
  private readonly taxonomyQueries = inject(TaxonomyQueries);
  private readonly queryClient = injectQueryClient();
  private readonly settingsQueries = inject(SettingsQueries);
  private readonly auth = inject(AuthService);
  readonly settingsQuery = injectQuery(() => this.settingsQueries.runtime());
  readonly permissions = computed(() => this.settingsQuery.data()?.data.permissions ?? {});
  readonly canUpload = computed(() => Boolean(this.permissions()['upload']));

  readonly documentsQuery = injectQuery(() =>
    this.queries.list({ page: 0, perPage: 100, sortBy: 'createdAt', orderBy: 'desc' }),
  );
  readonly categoriesQuery = injectQuery(() => this.taxonomyQueries.categories());
  readonly tagsQuery = injectQuery(() => this.taxonomyQueries.tags());
  readonly documents = computed(() => this.documentsQuery.data()?.data ?? []);
  readonly categories = computed(() => this.categoriesQuery.data() ?? []);
  readonly allTags = computed(() => this.tagsQuery.data() ?? []);
  readonly bookmarkMutation = injectMutation(() => ({
    mutationFn: ({ id, bookmarked }: { id: string; bookmarked: boolean }) =>
      this.api.setBookmark(id, bookmarked),
    onSuccess: async () => {
      await this.queryClient.invalidateQueries({ queryKey: documentKeys.all });
      await this.presentToast('Bookmark updated');
    },
    onError: (error) =>
      this.presentToast(getErrorMessage(error, 'Unable to update bookmark'), 'danger'),
  }));
  readonly deleteMutation = injectMutation(() => ({
    mutationFn: (id: string) => this.api.delete(id),
    onSuccess: () => this.queryClient.invalidateQueries({ queryKey: documentKeys.all }),
  }));
  readonly view = signal<'grid' | 'list'>('grid');
  readonly query = signal('');
  readonly category = signal('all');
  readonly tag = signal('all');
  readonly sort = signal('newest');
  readonly page = signal(1);
  readonly uploadOpen = signal(false);
  readonly perPage = 8;

  readonly filtered = computed(() => {
    const query = this.query().trim().toLowerCase();
    const category = this.category();
    const tag = this.tag();
    const sort = this.sort();

    const results = this.documents().filter((doc) => {
      if (category !== 'all' && doc.category !== category) return false;
      if (tag !== 'all' && !doc.tags.includes(tag)) return false;
      return !query || doc.title.toLowerCase().includes(query);
    });

    return [...results].sort((a, b) => {
      if (sort === 'oldest') return a.createdAt.localeCompare(b.createdAt);
      if (sort === 'name') return a.title.localeCompare(b.title);
      return b.createdAt.localeCompare(a.createdAt);
    });
  });

  readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.filtered().length / this.perPage)),
  );
  readonly paged = computed(() => {
    const safePage = Math.min(this.page(), this.totalPages());
    const start = (safePage - 1) * this.perPage;
    return this.filtered().slice(start, start + this.perPage);
  });

  setQuery(value: string | null | undefined): void {
    this.query.set(value ?? '');
    this.page.set(1);
  }

  setCategory(value: string): void {
    this.category.set(value);
    this.page.set(1);
  }

  setTag(value: string): void {
    this.tag.set(value);
    this.page.set(1);
  }

  setSort(value: string): void {
    this.sort.set(value);
    this.page.set(1);
  }

  changePage(next: number): void {
    this.page.set(Math.min(this.totalPages(), Math.max(1, next)));
  }

  async deleteDocument(id: string): Promise<void> {
    try {
      await this.deleteMutation.mutateAsync(id);
      const toast = await this.toastController.create({
        message: 'Document deleted',
        duration: 1700,
        position: 'bottom',
      });
      await toast.present();
    } catch (error) {
      const toast = await this.toastController.create({
        message: getErrorMessage(error, 'Unable to delete document'),
        color: 'danger',
        duration: 2000,
      });
      await toast.present();
    }
  }

  toggleBookmark(id: string): void {
    const document = this.documents().find((item) => item.id === id);
    if (document) {
      this.bookmarkMutation.mutate({ id, bookmarked: !document.bookmarked });
    }
  }

  canDelete(document: ShelfDocument): boolean {
    return Boolean(
      this.permissions()['delete_any'] ||
      (this.permissions()['delete_own'] && document.ownerId === this.auth.user()?.id),
    );
  }

  private async presentToast(message: string, color?: string): Promise<void> {
    const toast = await this.toastController.create({
      message,
      color,
      duration: 2200,
      position: 'top',
      cssClass: 'docshelf-toast',
    });
    await toast.present();
  }
}
