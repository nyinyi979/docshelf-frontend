import type { Category, Tag } from '../taxonomy/types';

export type DocumentFileType = 'pdf' | 'doc' | 'xlsx' | 'ppt' | 'img';

export interface ShelfDocument {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  fileUrl: string;
  fileType: DocumentFileType;
  fileSize: string;
  uploadedBy: string;
  isPublic: boolean;
  createdAt: string;
  versionNumber: number;
  bookmarked: boolean;
  ownerId: string;
  canManage: boolean;
  versions: DocumentVersion[];
}

export interface DocumentVersion {
  id: string;
  versionNumber: number;
  fileName: string;
  fileSize: string;
  uploadedBy: string;
  createdAt: string;
}

export interface UploadDocumentInput {
  file: File;
  title: string;
  description: string;
  categoryId: string;
  tagIds: string[];
  isPublic: boolean;
}

export interface ApiDocumentVersion {
  id: string;
  versionNumber: number;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  createdAt: string;
  uploadedBy: { id: string; username: string };
}

export interface ApiDocument {
  id: string;
  title: string;
  description: string;
  category: Category;
  tags: Tag[];
  uploadedBy: { id: string; username: string; email: string };
  fileName: string;
  mimeType: string;
  fileType: DocumentFileType;
  sizeBytes: number;
  visibility: 'public' | 'private';
  status: 'active' | 'processing' | 'archived';
  createdAt: string;
  updatedAt: string;
  versionCount: number;
  bookmarkCount: number;
  bookmarked: boolean;
  versions: ApiDocumentVersion[];
}

export interface DocumentQuery {
  page: number;
  perPage: number;
  query?: string;
  categoryId?: string;
  fileType?: DocumentFileType;
  sortBy?: 'title' | 'sizeBytes' | 'createdAt';
  orderBy?: 'asc' | 'desc';
}

export interface FileAccess {
  url: string;
  expiresAt: string;
}
