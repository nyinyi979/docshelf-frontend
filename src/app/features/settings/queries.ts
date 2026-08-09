import { Injectable, inject } from '@angular/core';
import { queryOptions } from '@tanstack/angular-query-experimental';
import { SettingsApi } from './api';

export const settingsKeys = {
  all: ['settings'] as const,
  runtime: () => [...settingsKeys.all, 'runtime'] as const,
};

@Injectable({ providedIn: 'root' })
export class SettingsQueries {
  private readonly api = inject(SettingsApi);

  runtime() {
    return queryOptions({
      queryKey: settingsKeys.runtime(),
      queryFn: () => this.api.runtime(),
      staleTime: 60_000,
    });
  }
}
