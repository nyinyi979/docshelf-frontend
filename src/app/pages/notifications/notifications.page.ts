import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { IonButton, IonContent, IonIcon } from '@ionic/angular/standalone';
import { notifications as seed } from '../../data/mocks';
import { ShelfNotification } from '../../models/document.model';

@Component({
  selector: 'app-notifications-page',
  standalone: true,
  imports: [IonButton, IonContent, IonIcon],
  templateUrl: './notifications.page.html',
  styleUrl: './notifications.page.scss',
})
export class NotificationsPage {
  private readonly router = inject(Router);

  readonly items = signal<ShelfNotification[]>(seed.map((item) => ({ ...item })));
  readonly page = signal(1);
  readonly perPage = 10;
  readonly unread = computed(() => this.items().filter((item) => !item.read).length);
  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.items().length / this.perPage)));
  readonly paged = computed(() => {
    const start = (this.page() - 1) * this.perPage;
    return this.items().slice(start, start + this.perPage);
  });

  iconFor(type: ShelfNotification['type']): string {
    if (type === 'upload') return 'cloud-upload-outline';
    if (type === 'view') return 'eye-outline';
    return 'folder-open-outline';
  }

  markAll(): void {
    this.items.update((items) => items.map((item) => ({ ...item, read: true })));
  }

  open(item: ShelfNotification): void {
    this.items.update((items) =>
      items.map((candidate) => (candidate.id === item.id ? { ...candidate, read: true } : candidate)),
    );
    void this.router.navigateByUrl(item.href);
  }

  changePage(next: number): void {
    this.page.set(Math.min(this.totalPages(), Math.max(1, next)));
  }
}
