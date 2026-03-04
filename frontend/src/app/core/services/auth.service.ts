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
    return !!localStorage.getItem('token');
  }

  getUser(): any | null {
    const raw = localStorage.getItem('user');
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  getRole(): string | null {
    return this.getUser()?.role || null;
  }
}
