import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { IonButton, IonContent, IonIcon, IonSpinner } from '@ionic/angular/standalone';
import { injectQuery } from '@tanstack/angular-query-experimental';
import { ActivityQueries } from '../../queries';
import { ActivityNotification } from '../../types';

@Component({
  selector: 'app-notifications-page',
  standalone: true,
  imports: [IonButton, IonContent, IonIcon, IonSpinner],
  templateUrl: './notifications.page.html',
  styleUrl: './notifications.page.scss',
})
export class NotificationsPage {
  private readonly router = inject(Router);
  private readonly queries = inject(ActivityQueries);
  readonly activityQuery = injectQuery(() => this.queries.mine());
  private readonly readIds = signal(new Set<string>());

  readonly items = computed<ActivityNotification[]>(() =>
    (this.activityQuery.data()?.data ?? []).map((item) => ({
      id: item.id,
      type:
        item.action === 'upload' || item.action === 'version'
          ? 'upload'
          : item.action === 'share'
            ? 'view'
            : 'category',
      message: `${item.description}${item.targetTitle ? `: ${item.targetTitle}` : ''}`,
      time: new Date(item.timestamp).toLocaleString(),
      read: this.readIds().has(item.id),
      href: item.targetId ? `/documents/${item.targetId}` : '/',
    })),
  );
  readonly page = signal(1);
  readonly perPage = 10;
  readonly unread = computed(() => this.items().filter((item) => !item.read).length);
  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.items().length / this.perPage)));
  readonly paged = computed(() => {
    const start = (this.page() - 1) * this.perPage;
    return this.items().slice(start, start + this.perPage);
  });

  iconFor(type: ActivityNotification['type']): string {
    if (type === 'upload') return 'cloud-upload-outline';
    if (type === 'view') return 'eye-outline';
    return 'folder-open-outline';
  }

  markAll(): void {
    this.readIds.set(new Set(this.items().map((item) => item.id)));
  }

  open(item: ActivityNotification): void {
    this.readIds.update((ids) => new Set(ids).add(item.id));
    void this.router.navigateByUrl(item.href);
  }

  changePage(next: number): void {
    this.page.set(Math.min(this.totalPages(), Math.max(1, next)));
  }
}
