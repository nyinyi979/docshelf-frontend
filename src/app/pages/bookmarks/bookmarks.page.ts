import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonButton, IonContent, IonIcon } from '@ionic/angular/standalone';
import { DocumentCardComponent } from '../../components/document-card/document-card.component';
import { DocumentStoreService } from '../../services/document-store.service';

@Component({
  selector: 'app-bookmarks-page',
  standalone: true,
  imports: [RouterLink, IonButton, IonContent, IonIcon, DocumentCardComponent],
  templateUrl: './bookmarks.page.html',
  styleUrl: './bookmarks.page.scss',
})
export class BookmarksPage {
  readonly store = inject(DocumentStoreService);
  readonly page = signal(1);
  readonly perPage = 3;
  readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.store.bookmarkedDocuments().length / this.perPage)),
  );
  readonly paged = computed(() => {
    const safePage = Math.min(this.page(), this.totalPages());
    const start = (safePage - 1) * this.perPage;
    return this.store.bookmarkedDocuments().slice(start, start + this.perPage);
  });

  toggleBookmark(id: string): void {
    this.store.toggleBookmark(id);
    if (this.page() > this.totalPages()) this.page.set(this.totalPages());
  }

  changePage(next: number): void {
    this.page.set(Math.min(this.totalPages(), Math.max(1, next)));
  }
}
