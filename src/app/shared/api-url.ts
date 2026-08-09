import { InjectionToken } from '@angular/core';

export const API_URL = new InjectionToken<string>('API_URL');

export function apiEndpoint(baseUrl: string, path: string): string {
  return `${baseUrl.replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}`;
}
