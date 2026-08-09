import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ApiResponse } from '../../shared/api.types';
import { API_URL, apiEndpoint } from '../../shared/api-url';
import { RuntimeSettings } from './types';

@Injectable({ providedIn: 'root' })
export class SettingsApi {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(API_URL);

  runtime(): Promise<ApiResponse<RuntimeSettings>> {
    return firstValueFrom(
      this.http.get<ApiResponse<RuntimeSettings>>(apiEndpoint(this.apiUrl, 'settings/runtime')),
    );
  }
}
