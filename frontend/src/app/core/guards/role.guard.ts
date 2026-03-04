import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const roles = route.data['roles'] as string[];

  if (!roles.includes(auth.getRole() || '')) {
    const firstRole = roles?.[0];
    const loginPath = firstRole === 'admin' ? '/auth/login/admin' : firstRole === 'staff' ? '/auth/login/staff' : '/auth/login/customer';
    router.navigate([loginPath]);
    return false;
  }
  return true;
};
