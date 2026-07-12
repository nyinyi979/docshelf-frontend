import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.page').then((m) => m.LoginPage),
    data: { title: 'Login' },
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/register/register.page').then((m) => m.RegisterPage),
    data: { title: 'Register' },
  },
  {
    path: '',
    loadComponent: () =>
      import('./layouts/app-shell/app-shell.component').then((m) => m.AppShellComponent),
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/home/home.page').then((m) => m.HomePage),
        data: { title: 'Home' },
      },
      {
        path: 'documents',
        loadComponent: () =>
          import('./pages/documents/documents.page').then((m) => m.DocumentsPage),
        data: { title: 'Documents' },
      },
      {
        path: 'documents/:id',
        loadComponent: () =>
          import('./pages/document-details/document-details.page').then(
            (m) => m.DocumentDetailsPage,
          ),
        data: { title: 'Document details' },
      },
      {
        path: 'categories',
        loadComponent: () =>
          import('./pages/categories/categories.page').then((m) => m.CategoriesPage),
        data: { title: 'Categories' },
      },
      {
        path: 'bookmarks',
        loadComponent: () =>
          import('./pages/bookmarks/bookmarks.page').then((m) => m.BookmarksPage),
        data: { title: 'Bookmarks' },
      },
      {
        path: 'search',
        loadComponent: () => import('./pages/search/search.page').then((m) => m.SearchPage),
        data: { title: 'Search' },
      },
      {
        path: 'notifications',
        loadComponent: () =>
          import('./pages/notifications/notifications.page').then((m) => m.NotificationsPage),
        data: { title: 'Notifications' },
      },
      {
        path: 'profile',
        loadComponent: () => import('./pages/profile/profile.page').then((m) => m.ProfilePage),
        data: { title: 'Profile' },
      },
    ],
  },
  {
    path: '**',
    loadComponent: () =>
      import('./pages/not-found/not-found.page').then((m) => m.NotFoundPage),
  },
];
