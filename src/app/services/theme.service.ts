import { DOCUMENT } from '@angular/common';
import { Injectable, inject, signal } from '@angular/core';

export type ThemePreference = 'light' | 'dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly storageKey = 'docshelf-theme';

  readonly isDark = signal(false);

  constructor() {
    const saved = this.readSavedTheme();
    const prefersDark =
      typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches;
    this.apply(saved ?? (prefersDark ? 'dark' : 'light'), false);
  }

  toggle(): void {
    this.apply(this.isDark() ? 'light' : 'dark');
  }

  setTheme(theme: ThemePreference): void {
    this.apply(theme);
  }

  private apply(theme: ThemePreference, persist = true): void {
    const dark = theme === 'dark';
    this.document.documentElement.classList.toggle('dark', dark);
    this.document.documentElement.style.colorScheme = theme;
    this.isDark.set(dark);

    if (persist && typeof localStorage !== 'undefined') {
      localStorage.setItem(this.storageKey, theme);
    }
  }

  private readSavedTheme(): ThemePreference | null {
    if (typeof localStorage === 'undefined') return null;
    const value = localStorage.getItem(this.storageKey);
    return value === 'light' || value === 'dark' ? value : null;
  }
}
