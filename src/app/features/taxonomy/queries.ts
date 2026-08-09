import { Injectable, inject } from '@angular/core';
import { queryOptions } from '@tanstack/angular-query-experimental';
import { TaxonomyApi } from './api';

export const taxonomyKeys = {
  all: ['taxonomy'] as const,
  categories: () => [...taxonomyKeys.all, 'categories'] as const,
  tags: () => [...taxonomyKeys.all, 'tags'] as const,
};

@Injectable({ providedIn: 'root' })
export class TaxonomyQueries {
  private readonly api = inject(TaxonomyApi);

  categories() {
    return queryOptions({
      queryKey: taxonomyKeys.categories(),
      queryFn: () => this.api.listCategories(),
      staleTime: 5 * 60_000,
    });
  }

  tags() {
    return queryOptions({
      queryKey: taxonomyKeys.tags(),
      queryFn: () => this.api.listTags(),
      staleTime: 5 * 60_000,
    });
  }
}
