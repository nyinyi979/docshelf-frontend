import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ApiResponse } from '../../shared/api.types';
import { API_URL, apiEndpoint } from '../../shared/api-url';
import { AuthUser, LoginRequest, LoginResponse } from './types';
import { TokenStorageService } from './token-storage.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(API_URL);
  private readonly tokenStorage = inject(TokenStorageService);

  readonly user = signal<AuthUser | null>(null);
  readonly loading = signal(false);
  readonly authenticated = computed(() => Boolean(this.tokenStorage.get()));

  async login(request: LoginRequest): Promise<AuthUser> {
    this.loading.set(true);
    try {
      const response = await firstValueFrom(
        this.http.post<LoginResponse>(this.endpoint('auth/login'), request),
      );
      this.tokenStorage.set(response.token);
      this.user.set(response.user);
      return response.user;
    } finally {
      this.loading.set(false);
    }
  }

  async register(request: {
    username: string;
    email: string;
    password: string;
  }): Promise<AuthUser> {
    const response = await firstValueFrom(
      this.http.post<ApiResponse<AuthUser>>(this.endpoint('auth/register'), request),
    );
    return response.data;
  }

  async loadCurrentUser(force = false): Promise<AuthUser | null> {
    if (!this.tokenStorage.get()) return null;
    if (this.user() && !force) return this.user();
    const response = await firstValueFrom(
      this.http.get<ApiResponse<AuthUser>>(this.endpoint('auth/me')),
    );
    this.user.set(response.data);
    return response.data;
  }

  async updateProfile(request: {
    username?: string;
    currentPassword?: string;
    newPassword?: string;
  }): Promise<AuthUser> {
    const response = await firstValueFrom(
      this.http.put<ApiResponse<AuthUser>>(this.endpoint('auth/me'), request),
    );
    this.user.set(response.data);
    return response.data;
  }

  async deleteAccount(password: string): Promise<void> {
    await firstValueFrom(
      this.http.delete<ApiResponse<{ id: string }>>(this.endpoint('auth/me'), {
        body: { password },
      }),
    );
    this.logout();
  }

  logout(): void {
    this.tokenStorage.clear();
    this.user.set(null);
  }

  private endpoint(path: string): string {
    return apiEndpoint(this.apiUrl, path);
  }
}
