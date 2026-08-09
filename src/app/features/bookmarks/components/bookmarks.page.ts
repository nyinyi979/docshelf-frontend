import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonButton, IonContent, IonIcon, IonSpinner } from '@ionic/angular/standalone';
import {
  injectMutation,
  injectQuery,
  injectQueryClient,
} from '@tanstack/angular-query-experimental';
import { DocumentsApi } from '../../documents/api';
import { DocumentCardComponent } from '../../documents/components/document-card/document-card.component';
import { documentKeys, DocumentQueries } from '../../documents/queries';
import { NotificationsService } from '../../../shared/notifications.service';

@Component({
  selector: 'app-bookmarks-page',
  standalone: true,
  imports: [RouterLink, IonButton, IonContent, IonIcon, IonSpinner, DocumentCardComponent],
  templateUrl: './bookmarks.page.html',
  styleUrl: './bookmarks.page.scss',
})
export class BookmarksPage {
  private readonly api = inject(DocumentsApi);
  private readonly queries = inject(DocumentQueries);
  private readonly queryClient = injectQueryClient();
  private readonly notifications = inject(NotificationsService);
  readonly bookmarksQuery = injectQuery(() => this.queries.bookmarks());
  readonly bookmarkedDocuments = computed(() => this.bookmarksQuery.data()?.data ?? []);
  readonly bookmarkMutation = injectMutation(() => ({
    mutationFn: (id: string) => this.api.setBookmark(id, false),
    onSuccess: () => this.queryClient.invalidateQueries({ queryKey: documentKeys.all }),
  }));
  readonly page = signal(1);
  readonly perPage = 3;
  readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.bookmarkedDocuments().length / this.perPage)),
  );
  readonly paged = computed(() => {
    const safePage = Math.min(this.page(), this.totalPages());
    const start = (safePage - 1) * this.perPage;
    return this.bookmarkedDocuments().slice(start, start + this.perPage);
  });

  async toggleBookmark(id: string): Promise<void> {
    try {
      await this.bookmarkMutation.mutateAsync(id);
      if (this.page() > this.totalPages()) this.page.set(this.totalPages());
      await this.notifications.success('Bookmark removed');
    } catch (error) {
      await this.notifications.error(error, 'Unable to update bookmark');
    }
  }

  changePage(next: number): void {
    this.page.set(Math.min(this.totalPages(), Math.max(1, next)));
  }
}
