import { Injectable, computed, signal } from '@angular/core';
import { documents as seedDocuments } from '../data/mocks';
import { ShelfDocument } from '../models/document.model';

@Injectable({ providedIn: 'root' })
export class DocumentStoreService {
  readonly documents = signal<ShelfDocument[]>(seedDocuments.map((item) => ({ ...item, tags: [...item.tags] })));
  readonly bookmarkedDocuments = computed(() => this.documents().filter((item) => item.bookmarked));

  toggleBookmark(id: string): void {
    this.documents.update((items) =>
      items.map((item) => (item.id === id ? { ...item, bookmarked: !item.bookmarked } : item)),
    );
  }

  deleteDocument(id: string): void {
    this.documents.update((items) => items.filter((item) => item.id !== id));
  }

  addDocument(document: ShelfDocument): void {
    this.documents.update((items) => [document, ...items]);
  }

  findById(id: string): ShelfDocument | undefined {
    return this.documents().find((item) => item.id === id);
  }
}
