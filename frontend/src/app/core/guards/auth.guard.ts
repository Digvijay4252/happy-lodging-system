import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.isLoggedIn()) {
    const targetUrl = state.url || '';
    const needsAdminLogin = targetUrl.startsWith('/admin') || targetUrl.startsWith('/auth/signup/staff');
    const loginPath = needsAdminLogin ? '/auth/login/admin' : '/auth/login/customer';
    router.navigate([loginPath], { queryParams: { redirect: targetUrl } });
    return false;
  }
  return true;
};
