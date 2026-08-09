import { Injectable, inject } from '@angular/core';
import { queryOptions } from '@tanstack/angular-query-experimental';
import { ActivityApi } from './api';

export const activityKeys = {
  all: ['activity'] as const,
  mine: () => [...activityKeys.all, 'mine'] as const,
};

@Injectable({ providedIn: 'root' })
export class ActivityQueries {
  private readonly api = inject(ActivityApi);

  mine() {
    return queryOptions({
      queryKey: activityKeys.mine(),
      queryFn: () => this.api.listMine(),
    });
  }
}
