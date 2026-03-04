import { Routes } from '@angular/router';
import { CustomerDashboardComponent } from '../pages/customer-dashboard.component';
import { CustomerBookingsComponent } from '../pages/customer-bookings.component';
import { CustomerIssuesComponent } from '../pages/customer-issues.component';
import { CustomerFeedbackComponent } from '../pages/customer-feedback.component';
import { authGuard } from '../../../core/guards/auth.guard';
import { roleGuard } from '../../../core/guards/role.guard';

export const customerRoutes: Routes = [
  {
    path: 'customer',
    component: CustomerDashboardComponent,
    title: 'Customer Dashboard | Happy Lodging',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['customer'] },
  },
  {
    path: 'customer/bookings',
    component: CustomerBookingsComponent,
    title: 'My Bookings | Happy Lodging',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['customer'] },
  },
  {
    path: 'customer/issues',
    component: CustomerIssuesComponent,
    title: 'My Issues | Happy Lodging',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['customer'] },
  },
  {
    path: 'customer/feedback',
    component: CustomerFeedbackComponent,
    title: 'My Feedback | Happy Lodging',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['customer'] },
  },
];
