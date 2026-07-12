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
  bookmarked?: boolean;
}

export interface ShelfNotification {
  id: string;
  type: 'upload' | 'view' | 'category';
  message: string;
  time: string;
  read: boolean;
  href: string;
}
