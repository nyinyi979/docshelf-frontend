import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ApiResponse, PaginatedResponse } from '../../shared/api.types';
import { API_URL, apiEndpoint } from '../../shared/api-url';
import { ApiDocument, DocumentQuery, FileAccess, UploadDocumentInput } from './types';
import { documentFileType } from './utils';

@Injectable({ providedIn: 'root' })
export class DocumentsApi {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(API_URL);

  list(query: DocumentQuery): Promise<PaginatedResponse<ApiDocument>> {
    return firstValueFrom(
      this.http.get<PaginatedResponse<ApiDocument>>(this.endpoint('documents'), {
        params: this.params(query),
      }),
    );
  }

  get(id: string): Promise<ApiResponse<ApiDocument>> {
    return firstValueFrom(
      this.http.get<ApiResponse<ApiDocument>>(this.endpoint(`documents/${id}`)),
    );
  }

  bookmarks(query: DocumentQuery): Promise<PaginatedResponse<ApiDocument>> {
    return firstValueFrom(
      this.http.get<PaginatedResponse<ApiDocument>>(this.endpoint('documents/bookmarks'), {
        params: this.params(query),
      }),
    );
  }

  setBookmark(id: string, bookmarked: boolean): Promise<ApiResponse<unknown>> {
    return firstValueFrom(
      this.http.put<ApiResponse<unknown>>(this.endpoint(`documents/${id}/bookmark`), {
        bookmarked,
      }),
    );
  }

  delete(id: string): Promise<ApiResponse<unknown>> {
    return firstValueFrom(this.http.delete<ApiResponse<unknown>>(this.endpoint(`documents/${id}`)));
  }

  update(
    id: string,
    data: { visibility?: 'public' | 'private' },
  ): Promise<ApiResponse<ApiDocument>> {
    return firstValueFrom(
      this.http.put<ApiResponse<ApiDocument>>(this.endpoint('documents'), { id, ...data }),
    );
  }

  async uploadFile(file: File): Promise<{ url: string; filename: string }> {
    const formData = new FormData();
    formData.append('image', file);
    const response = await firstValueFrom(
      this.http.post<ApiResponse<{ url: string; filename: string }>>(
        this.endpoint('files'),
        formData,
      ),
    );
    return response.data;
  }

  async persistFile(url: string): Promise<string> {
    const response = await firstValueFrom(
      this.http.post<ApiResponse<{ url: string }>>(this.endpoint('files/upload'), { url }),
    );
    return response.data.url;
  }

  async discardTemporaryFile(url: string): Promise<void> {
    await firstValueFrom(
      this.http.delete<ApiResponse<unknown>>(this.endpoint('files'), {
        params: { url },
      }),
    );
  }

  create(data: Record<string, unknown>): Promise<ApiResponse<ApiDocument>> {
    return firstValueFrom(
      this.http.post<ApiResponse<ApiDocument>>(this.endpoint('documents'), data),
    );
  }

  addVersion(documentId: string, data: Record<string, unknown>): Promise<ApiResponse<ApiDocument>> {
    return firstValueFrom(
      this.http.post<ApiResponse<ApiDocument>>(
        this.endpoint(`documents/${documentId}/versions`),
        data,
      ),
    );
  }

  accessUrl(documentId: string, versionId?: string): Promise<ApiResponse<FileAccess>> {
    return firstValueFrom(
      this.http.get<ApiResponse<FileAccess>>(this.endpoint(`documents/${documentId}/access-url`), {
        params: versionId ? { versionId } : {},
      }),
    );
  }

  async uploadDocument(input: UploadDocumentInput): Promise<ApiResponse<ApiDocument>> {
    const temporary = await this.uploadFile(input.file);
    try {
      return await this.create({
        title: input.title,
        description: input.description,
        categoryId: input.categoryId,
        tagIds: input.tagIds,
        temporaryFileUrl: temporary.url,
        fileName: input.file.name,
        mimeType: input.file.type || 'application/octet-stream',
        fileType: documentFileType(input.file.name),
        sizeBytes: input.file.size,
        visibility: input.isPublic ? 'public' : 'private',
      });
    } catch (error) {
      try {
        await this.discardTemporaryFile(temporary.url);
      } catch {
        // The API may already have promoted and removed the temporary file.
      }
      throw error;
    }
  }

  async uploadVersionFile(documentId: string, file: File): Promise<ApiResponse<ApiDocument>> {
    const temporary = await this.uploadFile(file);
    const permanentUrl = await this.persistFile(temporary.url);
    return this.addVersion(documentId, {
      fileUrl: permanentUrl,
      fileKey: permanentUrl,
      fileName: file.name,
      mimeType: file.type || 'application/octet-stream',
      fileType: documentFileType(file.name),
      sizeBytes: file.size,
    });
  }

  private params(query: DocumentQuery): Record<string, string | number> {
    return Object.fromEntries(
      Object.entries(query).filter((entry) => entry[1] !== undefined),
    ) as Record<string, string | number>;
  }

  private endpoint(path: string): string {
    return apiEndpoint(this.apiUrl, path);
  }
}
