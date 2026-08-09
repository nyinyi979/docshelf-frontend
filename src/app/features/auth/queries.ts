import { Injectable, inject } from '@angular/core';
import { queryOptions } from '@tanstack/angular-query-experimental';
import { AuthService } from './api';

export const authKeys = {
  all: ['auth'] as const,
  session: () => [...authKeys.all, 'session'] as const,
};

@Injectable({ providedIn: 'root' })
export class AuthQueries {
  private readonly api = inject(AuthService);

  session() {
    return queryOptions({
      queryKey: authKeys.session(),
      queryFn: () => this.api.loadCurrentUser(true),
      staleTime: 60_000,
    });
  }
}
