import { Routes } from '@angular/router';
import { CustomerDashboardComponent } from '../pages/customer-dashboard.component';
import { authGuard } from '../../../core/guards/auth.guard';
import { roleGuard } from '../../../core/guards/role.guard';

export const customerRoutes: Routes = [
  {
    path: 'customer',
    component: CustomerDashboardComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['customer'] },
  },
];
