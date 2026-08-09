import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { PaginatedResponse } from '../../shared/api.types';
import { API_URL, apiEndpoint } from '../../shared/api-url';
import { ActivityItem } from './types';

@Injectable({ providedIn: 'root' })
export class ActivityApi {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(API_URL);

  listMine(): Promise<PaginatedResponse<ActivityItem>> {
    return firstValueFrom(
      this.http.get<PaginatedResponse<ActivityItem>>(this.endpoint('activity/me'), {
        params: { page: 0, perPage: 50 },
      }),
    );
  }

  private endpoint(path: string): string {
    return apiEndpoint(this.apiUrl, path);
  }
}
