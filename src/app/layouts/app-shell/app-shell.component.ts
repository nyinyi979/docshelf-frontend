import { NgClass } from '@angular/common';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, NavigationEnd, Router, RouterLink } from '@angular/router';
import { IonIcon, IonRouterOutlet } from '@ionic/angular/standalone';
import { filter } from 'rxjs';
import { currentUser } from '../../data/mocks';
import { ThemeService } from '../../services/theme.service';

interface NavigationItem {
  path: string;
  label: string;
  icon: string;
  exact?: boolean;
}

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [NgClass, RouterLink, IonIcon, IonRouterOutlet],
  templateUrl: './app-shell.component.html',
  styleUrl: './app-shell.component.scss',
})
export class AppShellComponent {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  readonly theme = inject(ThemeService);
  readonly currentUser = currentUser;
  readonly pageTitle = signal('Home');
  readonly currentPath = signal(this.router.url.split('?')[0]);
  readonly sidebarOpen = signal(false);
  readonly collapsed = signal(false);

  readonly navItems: NavigationItem[] = [
    { path: '/', label: 'Home', icon: 'home-outline', exact: true },
    { path: '/documents', label: 'Documents', icon: 'documents-outline' },
    { path: '/categories', label: 'Categories', icon: 'folder-open-outline' },
    { path: '/bookmarks', label: 'Bookmarks', icon: 'bookmark-outline' },
    { path: '/search', label: 'Search', icon: 'search-outline' },
    { path: '/notifications', label: 'Notifications', icon: 'notifications-outline' },
  ];

  constructor() {
    this.updateRouteState();
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => {
        this.updateRouteState();
        this.closeSidebar();
      });
  }

  isActive(path: string, exact = false): boolean {
    const current = this.currentPath();
    return exact ? current === path : current === path || current.startsWith(`${path}/`);
  }

  openSidebar(): void {
    this.sidebarOpen.set(true);
  }

  closeSidebar(): void {
    this.sidebarOpen.set(false);
  }

  toggleCollapsed(): void {
    this.collapsed.update((value) => !value);
  }

  openSearch(value: string): void {
    const query = value.trim();
    void this.router.navigate(['/search'], {
      queryParams: query ? { q: query } : undefined,
    });
  }

  private updateRouteState(): void {
    this.currentPath.set(this.router.url.split('?')[0]);
    let active = this.route;
    while (active.firstChild) active = active.firstChild;
    this.pageTitle.set(active.snapshot?.data['title'] ?? 'DocShelf');
  }
}
