import { Routes } from '@angular/router';
import { authGuard } from './features/auth/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/components/login/login.page').then((m) => m.LoginPage),
    data: { title: 'Login' },
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./features/auth/components/register/register.page').then((m) => m.RegisterPage),
    data: { title: 'Register' },
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./shell/app-shell.component').then((m) => m.AppShellComponent),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/dashboard/components/home/home.page').then((m) => m.HomePage),
        data: { title: 'Home' },
      },
      {
        path: 'documents',
        loadComponent: () =>
          import('./features/documents/components/documents/documents.page').then(
            (m) => m.DocumentsPage,
          ),
        data: { title: 'Documents' },
      },
      {
        path: 'documents/:id',
        loadComponent: () =>
          import('./features/documents/components/document-details/document-details.page').then(
            (m) => m.DocumentDetailsPage,
          ),
        data: { title: 'Document details' },
      },
      {
        path: 'categories',
        loadComponent: () =>
          import('./features/taxonomy/components/categories/categories.page').then(
            (m) => m.CategoriesPage,
          ),
        data: { title: 'Categories' },
      },
      {
        path: 'bookmarks',
        loadComponent: () =>
          import('./features/bookmarks/components/bookmarks.page').then((m) => m.BookmarksPage),
        data: { title: 'Bookmarks' },
      },
      {
        path: 'search',
        loadComponent: () =>
          import('./features/search/components/search.page').then((m) => m.SearchPage),
        data: { title: 'Search' },
      },
      {
        path: 'notifications',
        loadComponent: () =>
          import('./features/activity/components/notifications/notifications.page').then(
            (m) => m.NotificationsPage,
          ),
        data: { title: 'Notifications' },
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./features/auth/components/profile/profile.page').then((m) => m.ProfilePage),
        data: { title: 'Profile' },
      },
    ],
  },
  {
    path: '**',
    loadComponent: () => import('./not-found/not-found.page').then((m) => m.NotFoundPage),
  },
];
