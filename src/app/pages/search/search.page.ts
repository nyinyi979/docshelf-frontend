import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonContent, IonIcon, IonSearchbar, ToastController } from '@ionic/angular/standalone';
import { DocumentStoreService } from '../../services/document-store.service';

interface HighlightPart {
  text: string;
  match: boolean;
}

@Component({
  selector: 'app-search-page',
  standalone: true,
  imports: [RouterLink, IonContent, IonIcon, IonSearchbar],
  templateUrl: './search.page.html',
  styleUrl: './search.page.scss',
})
export class SearchPage {
  private readonly store = inject(DocumentStoreService);
  private readonly toastController = inject(ToastController);
  private readonly recentKey = 'docshelf:recent-searches';

  readonly filters = ['All', 'PDF', 'Document', 'Spreadsheet'] as const;
  readonly query = signal('');
  readonly filter = signal<(typeof this.filters)[number]>('All');
  readonly recent = signal<string[]>(this.readRecent());
  readonly page = signal(1);
  readonly perPage = 8;

  readonly results = computed(() => {
    const query = this.query().trim().toLowerCase();
    if (!query) return [];
    const filter = this.filter();
    return this.store.documents().filter((doc) => {
      if (filter === 'PDF' && doc.fileType !== 'pdf') return false;
      if (filter === 'Document' && doc.fileType !== 'doc') return false;
      if (filter === 'Spreadsheet' && doc.fileType !== 'xlsx') return false;
      const haystack = `${doc.title} ${doc.description} ${doc.tags.join(' ')} ${doc.category}`.toLowerCase();
      return haystack.includes(query);
    });
  });

  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.results().length / this.perPage)));
  readonly paged = computed(() => {
    const start = (this.page() - 1) * this.perPage;
    return this.results().slice(start, start + this.perPage);
  });

  setQuery(value: string | null | undefined): void {
    this.query.set(value ?? '');
    this.page.set(1);
  }

  setFilter(filter: (typeof this.filters)[number]): void {
    this.filter.set(filter);
    this.page.set(1);
  }

  commit(term = this.query()): void {
    const clean = term.trim();
    if (!clean) return;
    const next = [clean, ...this.recent().filter((item) => item !== clean)].slice(0, 6);
    this.recent.set(next);
    localStorage.setItem(this.recentKey, JSON.stringify(next));
  }

  useRecent(term: string): void {
    this.setQuery(term);
  }

  changePage(next: number): void {
    this.page.set(Math.min(this.totalPages(), Math.max(1, next)));
  }

  highlight(text: string): HighlightPart[] {
    const term = this.query().trim();
    if (!term) return [{ text, match: false }];
    const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return text
      .split(new RegExp(`(${escaped})`, 'gi'))
      .filter(Boolean)
      .map((part) => ({ text: part, match: part.toLowerCase() === term.toLowerCase() }));
  }

  private readRecent(): string[] {
    try {
      return JSON.parse(localStorage.getItem(this.recentKey) ?? '[]');
    } catch {
      return [];
    }
  }
}
