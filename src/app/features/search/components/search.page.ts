import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { IonContent, IonIcon, IonSearchbar, IonSpinner } from '@ionic/angular/standalone';
import { injectQuery } from '@tanstack/angular-query-experimental';
import { DocumentFileType } from '../../documents/types';
import { DocumentQueries } from '../../documents/queries';

interface HighlightPart {
  text: string;
  match: boolean;
}

@Component({
  selector: 'app-search-page',
  standalone: true,
  imports: [RouterLink, IonContent, IonIcon, IonSearchbar, IonSpinner],
  templateUrl: './search.page.html',
  styleUrl: './search.page.scss',
})
export class SearchPage {
  private readonly queries = inject(DocumentQueries);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly recentKey = 'docshelf:recent-searches';

  readonly filters = ['All', 'PDF', 'Document', 'Spreadsheet'] as const;
  readonly query = signal('');
  readonly filter = signal<(typeof this.filters)[number]>('All');
  readonly recent = signal<string[]>(this.readRecent());
  readonly page = signal(1);
  readonly perPage = 8;

  readonly resultsQuery = injectQuery(() =>
    this.queries.list({
      page: this.page() - 1,
      perPage: this.perPage,
      query: this.query().trim() || undefined,
      fileType: this.fileType(),
      sortBy: 'createdAt',
      orderBy: 'desc',
    }),
  );
  readonly results = computed(() => this.resultsQuery.data()?.data ?? []);
  readonly totalPages = computed(() =>
    Math.max(1, Math.ceil((this.resultsQuery.data()?.total ?? 0) / this.perPage)),
  );
  readonly paged = this.results;

  constructor() {
    this.route.queryParamMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => this.setQuery(params.get('q')));
  }

  setQuery(value: string | null | undefined): void {
    this.query.set(value ?? '');
    this.page.set(1);
  }

  setFilter(filter: (typeof this.filters)[number]): void {
    this.filter.set(filter);
    this.page.set(1);
  }

  private fileType(): DocumentFileType | undefined {
    if (this.filter() === 'PDF') return 'pdf';
    if (this.filter() === 'Document') return 'doc';
    if (this.filter() === 'Spreadsheet') return 'xlsx';
    return undefined;
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
