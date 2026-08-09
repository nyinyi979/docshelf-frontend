import { Injectable, inject } from '@angular/core';
import { DocumentsApi } from './api';
import { FileAccess } from './types';

const REFRESH_MARGIN_MS = 5 * 60 * 1000;

@Injectable({ providedIn: 'root' })
export class FileAccessService {
  private readonly api = inject(DocumentsApi);
  private readonly cache = new Map<string, FileAccess>();

  async getUrl(documentId: string, versionId?: string): Promise<string> {
    const key = `${documentId}:${versionId ?? 'current'}`;
    const cached = this.cache.get(key);
    if (cached && new Date(cached.expiresAt).getTime() - Date.now() > REFRESH_MARGIN_MS) {
      return cached.url;
    }
    const response = await this.api.accessUrl(documentId, versionId);
    this.cache.set(key, response.data);
    return response.data.url;
  }

  async open(documentId: string, versionId?: string): Promise<void> {
    const url = await this.getUrl(documentId, versionId);
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  invalidate(documentId: string): void {
    for (const key of this.cache.keys()) {
      if (key.startsWith(`${documentId}:`)) this.cache.delete(key);
    }
  }
}
