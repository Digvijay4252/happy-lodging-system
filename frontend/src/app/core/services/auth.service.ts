import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private base = `${environment.apiUrl}/auth`;

  constructor(private http: HttpClient) {}

  register(payload: { name: string; email: string; password: string }) {
    return this.http.post(`${this.base}/register`, payload);
  }

  registerAdmin(payload: { name: string; email: string; password: string; setup_key?: string }) {
    return this.http.post(`${this.base}/admin/register`, payload);
  }

  registerStaff(payload: { name: string; email: string; password: string; role: 'staff' }) {
    return this.http.post(`${this.base}/staff/register`, payload);
  }

  login(payload: { email: string; password: string; role?: 'admin' | 'staff' | 'customer' }) {
    return this.http.post<any>(`${this.base}/login`, payload);
  }

  saveSession(token: string, user: any) {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  isLoggedIn(): boolean {
    const token = this.getToken();
    if (!token) return false;
    const payload = this.decodeTokenPayload(token);
    if (!payload?.exp) return true;
    const now = Math.floor(Date.now() / 1000);
    return payload.exp > now;
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getUser(): any | null {
    const raw = localStorage.getItem('user');
    if (!raw) {
      const payload = this.decodeTokenPayload(this.getToken());
      if (!payload) return null;
      return { id: payload.id, role: payload.role };
    }
    try {
      return JSON.parse(raw);
    } catch {
      const payload = this.decodeTokenPayload(this.getToken());
      if (!payload) return null;
      return { id: payload.id, role: payload.role };
    }
  }

  getRole(): string | null {
    return this.getUser()?.role || this.decodeTokenPayload(this.getToken())?.role || null;
  }

  private decodeTokenPayload(token: string | null): any | null {
    if (!token) return null;
    try {
      const parts = token.split('.');
      if (parts.length < 2) return null;
      let payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      const padding = payload.length % 4;
      if (padding) {
        payload += '='.repeat(4 - padding);
      }
      const decoded = atob(payload);
      return JSON.parse(decoded);
    } catch {
      return null;
    }
  }
}
