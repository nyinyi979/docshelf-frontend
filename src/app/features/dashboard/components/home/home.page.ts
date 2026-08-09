import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonChip, IonContent, IonIcon, IonSpinner } from '@ionic/angular/standalone';
import {
  injectMutation,
  injectQuery,
  injectQueryClient,
} from '@tanstack/angular-query-experimental';
import { ActivityQueries } from '../../../activity/queries';
import { AuthService } from '../../../auth/api';
import { DocumentsApi } from '../../../documents/api';
import { DocumentCardComponent } from '../../../documents/components/document-card/document-card.component';
import { documentKeys, DocumentQueries } from '../../../documents/queries';
import { TaxonomyQueries } from '../../../taxonomy/queries';
import { NotificationsService } from '../../../../shared/notifications.service';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [RouterLink, IonChip, IonContent, IonIcon, IonSpinner, DocumentCardComponent],
  templateUrl: './home.page.html',
  styleUrl: './home.page.scss',
})
export class HomePage {
  readonly auth = inject(AuthService);
  private readonly documentsApi = inject(DocumentsApi);
  private readonly documentQueries = inject(DocumentQueries);
  private readonly taxonomyQueries = inject(TaxonomyQueries);
  private readonly activityQueries = inject(ActivityQueries);
  private readonly queryClient = injectQueryClient();
  private readonly notifications = inject(NotificationsService);
  readonly documentsQuery = injectQuery(() =>
    this.documentQueries.list({ page: 0, perPage: 8, sortBy: 'createdAt', orderBy: 'desc' }),
  );
  readonly bookmarksQuery = injectQuery(() => this.documentQueries.bookmarks());
  readonly categoriesQuery = injectQuery(() => this.taxonomyQueries.categories());
  readonly activityQuery = injectQuery(() => this.activityQueries.mine());
  readonly isPending = computed(
    () =>
      this.documentsQuery.isPending() ||
      this.bookmarksQuery.isPending() ||
      this.categoriesQuery.isPending() ||
      this.activityQuery.isPending(),
  );
  readonly isError = computed(
    () =>
      this.documentsQuery.isError() ||
      this.bookmarksQuery.isError() ||
      this.categoriesQuery.isError() ||
      this.activityQuery.isError(),
  );
  readonly recentDocuments = computed(() => this.documentsQuery.data()?.data ?? []);
  readonly categories = computed(() => this.categoriesQuery.data() ?? []);
  readonly activityItems = computed(() => this.activityQuery.data()?.data ?? []);
  readonly bookmarkMutation = injectMutation(() => ({
    mutationFn: ({ id, bookmarked }: { id: string; bookmarked: boolean }) =>
      this.documentsApi.setBookmark(id, bookmarked),
    onSuccess: async () => {
      await this.queryClient.invalidateQueries({ queryKey: documentKeys.all });
      await this.notifications.success('Bookmark updated');
    },
    onError: (error) => this.notifications.error(error, 'Unable to update bookmark'),
  }));
  readonly deleteMutation = injectMutation(() => ({
    mutationFn: (id: string) => this.documentsApi.delete(id),
    onSuccess: async () => {
      await this.queryClient.invalidateQueries({ queryKey: documentKeys.all });
      await this.notifications.success('Document deleted');
    },
    onError: (error) => this.notifications.error(error, 'Unable to delete document'),
  }));
  readonly currentUser = computed(() => this.auth.user());
  readonly activityFeed = computed(() =>
    this.activityItems()
      .slice(0, 8)
      .map((item) => ({
        id: item.id,
        who: item.userName ?? 'You',
        action: item.description,
        target: item.targetTitle ?? item.detail,
        time: new Date(item.timestamp).toLocaleString(),
      })),
  );
  readonly stats = computed(() => [
    {
      label: 'Total Documents',
      value: String(this.documentsQuery.data()?.total ?? 0),
      icon: 'documents-outline',
    },
    {
      label: 'My Bookmarks',
      value: String(this.bookmarksQuery.data()?.total ?? 0),
      icon: 'bookmark-outline',
    },
    {
      label: 'Categories',
      value: String(this.categories().length),
      icon: 'folder-open-outline',
    },
    {
      label: 'Recent Activity',
      value: String(this.activityItems().length),
      icon: 'pulse-outline',
    },
  ]);

  toggleBookmark(id: string): void {
    const document = this.recentDocuments().find((item) => item.id === id);
    if (document) {
      this.bookmarkMutation.mutate({ id, bookmarked: !document.bookmarked });
    }
  }

  initials(name: string): string {
    const source = name === 'You' ? (this.currentUser()?.username ?? '') : name;
    return source
      .split(/\s+/)
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }
}
