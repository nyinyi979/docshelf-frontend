import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ApiResponse } from '../../shared/api.types';
import { API_URL, apiEndpoint } from '../../shared/api-url';
import { Category, Tag } from './types';

@Injectable({ providedIn: 'root' })
export class TaxonomyApi {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(API_URL);

  async listCategories(): Promise<Category[]> {
    const response = await firstValueFrom(
      this.http.get<ApiResponse<Category[]>>(this.endpoint('categories/all')),
    );
    return response.data;
  }

  async listTags(): Promise<Tag[]> {
    const response = await firstValueFrom(
      this.http.get<ApiResponse<Tag[]>>(this.endpoint('tags/all')),
    );
    return response.data;
  }

  private endpoint(path: string): string {
    return apiEndpoint(this.apiUrl, path);
  }
}
