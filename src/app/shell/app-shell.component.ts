import { NgClass } from '@angular/common';
import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, NavigationEnd, Router, RouterLink } from '@angular/router';
import { IonIcon, IonRouterOutlet, IonSpinner } from '@ionic/angular/standalone';
import { injectQuery, injectQueryClient } from '@tanstack/angular-query-experimental';
import { filter } from 'rxjs';
import { AuthService } from '../features/auth/api';
import { AuthQueries } from '../features/auth/queries';
import { SettingsQueries } from '../features/settings/queries';

interface NavigationItem {
  path: string;
  label: string;
  icon: string;
  exact?: boolean;
}

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [NgClass, RouterLink, IonIcon, IonRouterOutlet, IonSpinner],
  templateUrl: './app-shell.component.html',
  styleUrl: './app-shell.component.scss',
})
export class AppShellComponent {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly auth = inject(AuthService);
  private readonly authQueries = inject(AuthQueries);
  private readonly queryClient = injectQueryClient();
  private readonly settingsQueries = inject(SettingsQueries);
  readonly sessionQuery = injectQuery(() => this.authQueries.session());
  readonly settingsQuery = injectQuery(() => this.settingsQueries.runtime());
  readonly siteName = computed(
    () => this.settingsQuery.data()?.data.general.siteName ?? 'DocShelf',
  );
  readonly supportEmail = computed(
    () => this.settingsQuery.data()?.data.general.supportEmail ?? '',
  );

  readonly currentUser = computed(() => {
    const user = this.auth.user();
    const name = user?.username ?? 'DocShelf user';
    return {
      name,
      email: user?.email ?? '',
      initials: name
        .split(/\s+/)
        .map((part) => part[0])
        .join('')
        .slice(0, 2)
        .toUpperCase(),
    };
  });
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

  logout(): void {
    this.auth.logout();
    this.queryClient.clear();
    void this.router.navigateByUrl('/login');
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
