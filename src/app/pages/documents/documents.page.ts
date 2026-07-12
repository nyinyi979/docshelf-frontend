import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  IonButton,
  IonContent,
  IonIcon,
  IonSearchbar,
  IonSelect,
  IonSelectOption,
  ToastController,
} from '@ionic/angular/standalone';
import { DocumentCardComponent } from '../../components/document-card/document-card.component';
import { UploadModalComponent } from '../../components/upload-modal/upload-modal.component';
import { allTags, categories } from '../../data/mocks';
import { DocumentStoreService } from '../../services/document-store.service';

@Component({
  selector: 'app-documents-page',
  standalone: true,
  imports: [
    FormsModule,
    IonButton,
    IonContent,
    IonIcon,
    IonSearchbar,
    IonSelect,
    IonSelectOption,
    DocumentCardComponent,
    UploadModalComponent,
  ],
  templateUrl: './documents.page.html',
  styleUrl: './documents.page.scss',
})
export class DocumentsPage {
  readonly store = inject(DocumentStoreService);
  private readonly toastController = inject(ToastController);

  readonly categories = categories;
  readonly allTags = allTags;
  readonly view = signal<'grid' | 'list'>('grid');
  readonly query = signal('');
  readonly category = signal('all');
  readonly tag = signal('all');
  readonly sort = signal('newest');
  readonly page = signal(1);
  readonly uploadOpen = signal(false);
  readonly perPage = 8;

  readonly filtered = computed(() => {
    const query = this.query().trim().toLowerCase();
    const category = this.category();
    const tag = this.tag();
    const sort = this.sort();

    const results = this.store.documents().filter((doc) => {
      if (category !== 'all' && doc.category !== category) return false;
      if (tag !== 'all' && !doc.tags.includes(tag)) return false;
      return !query || doc.title.toLowerCase().includes(query);
    });

    return [...results].sort((a, b) => {
      if (sort === 'oldest') return a.createdAt.localeCompare(b.createdAt);
      if (sort === 'name') return a.title.localeCompare(b.title);
      return b.createdAt.localeCompare(a.createdAt);
    });
  });

  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.filtered().length / this.perPage)));
  readonly paged = computed(() => {
    const safePage = Math.min(this.page(), this.totalPages());
    const start = (safePage - 1) * this.perPage;
    return this.filtered().slice(start, start + this.perPage);
  });

  setQuery(value: string | null | undefined): void {
    this.query.set(value ?? '');
    this.page.set(1);
  }

  setCategory(value: string): void {
    this.category.set(value);
    this.page.set(1);
  }

  setTag(value: string): void {
    this.tag.set(value);
    this.page.set(1);
  }

  setSort(value: string): void {
    this.sort.set(value);
    this.page.set(1);
  }

  changePage(next: number): void {
    this.page.set(Math.min(this.totalPages(), Math.max(1, next)));
  }

  async deleteDocument(id: string): Promise<void> {
    this.store.deleteDocument(id);
    const toast = await this.toastController.create({
      message: 'Document deleted',
      duration: 1700,
      position: 'bottom',
    });
    await toast.present();
  }
}
