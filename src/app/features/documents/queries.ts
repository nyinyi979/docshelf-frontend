import { Injectable, inject } from '@angular/core';
import { queryOptions } from '@tanstack/angular-query-experimental';
import { AuthService } from '../auth/api';
import { DocumentsApi } from './api';
import { ApiDocument, DocumentQuery, ShelfDocument } from './types';
import { formatBytes } from './utils';

export const documentKeys = {
  all: ['documents'] as const,
  lists: () => [...documentKeys.all, 'list'] as const,
  list: (query: DocumentQuery) => [...documentKeys.lists(), query] as const,
  details: () => [...documentKeys.all, 'detail'] as const,
  detail: (id: string) => [...documentKeys.details(), id] as const,
  bookmarks: () => [...documentKeys.all, 'bookmarks'] as const,
};

@Injectable({ providedIn: 'root' })
export class DocumentQueries {
  private readonly api = inject(DocumentsApi);
  private readonly auth = inject(AuthService);

  list(query: DocumentQuery) {
    return queryOptions({
      queryKey: documentKeys.list(query),
      queryFn: () => this.api.list(query),
      select: (response) => ({
        ...response,
        data: response.data.map((document) => this.map(document)),
      }),
    });
  }

  detail(id: string) {
    return queryOptions({
      queryKey: documentKeys.detail(id),
      queryFn: () => this.api.get(id),
      select: (response) => ({ ...response, data: this.map(response.data) }),
      enabled: Boolean(id),
    });
  }

  bookmarks() {
    const query = { page: 0, perPage: 100 } satisfies DocumentQuery;
    return queryOptions({
      queryKey: documentKeys.bookmarks(),
      queryFn: () => this.api.bookmarks(query),
      select: (response) => ({
        ...response,
        data: response.data.map((document) => this.map(document)),
      }),
    });
  }

  private map(document: ApiDocument): ShelfDocument {
    const user = this.auth.user();
    return {
      id: document.id,
      title: document.title,
      description: document.description,
      category: document.category.name,
      tags: document.tags.map((tag) => tag.name),
      fileUrl: '',
      fileType: document.fileType,
      fileSize: formatBytes(document.sizeBytes),
      uploadedBy: document.uploadedBy.username,
      isPublic: document.visibility === 'public',
      createdAt: document.createdAt.slice(0, 10),
      versionNumber: document.versionCount,
      bookmarked: document.bookmarked,
      ownerId: document.uploadedBy.id,
      canManage: user?.role === 'admin' || user?.id === document.uploadedBy.id,
      versions: document.versions.map((version) => ({
        id: version.id,
        versionNumber: version.versionNumber,
        fileName: version.fileName,
        fileSize: formatBytes(version.sizeBytes),
        uploadedBy: version.uploadedBy.username,
        createdAt: version.createdAt.slice(0, 10),
      })),
    };
  }
}
