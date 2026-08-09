import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonContent, IonIcon, IonSpinner } from '@ionic/angular/standalone';
import { injectQuery } from '@tanstack/angular-query-experimental';
import { DocumentQueries } from '../../../documents/queries';
import { TaxonomyQueries } from '../../queries';

@Component({
  selector: 'app-categories-page',
  standalone: true,
  imports: [RouterLink, IonContent, IonIcon, IonSpinner],
  templateUrl: './categories.page.html',
  styleUrl: './categories.page.scss',
})
export class CategoriesPage {
  private readonly documentQueries = inject(DocumentQueries);
  private readonly taxonomyQueries = inject(TaxonomyQueries);
  readonly categoriesQuery = injectQuery(() => this.taxonomyQueries.categories());
  readonly documentsQuery = injectQuery(() =>
    this.documentQueries.list({ page: 0, perPage: 100, sortBy: 'title', orderBy: 'asc' }),
  );
  readonly categories = () => this.categoriesQuery.data() ?? [];
  readonly documents = () => this.documentsQuery.data()?.data ?? [];

  categoryDocuments(name: string) {
    return this.documents()
      .filter((document) => document.category === name)
      .slice(0, 4);
  }
}
