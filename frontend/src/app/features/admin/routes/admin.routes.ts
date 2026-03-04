import { Routes } from '@angular/router';
import { AdminDashboardComponent } from '../pages/admin-dashboard.component';
import { AdminRoomManagementComponent } from '../pages/admin-room-management.component';
import { AdminAllBookingsComponent } from '../pages/admin-all-bookings.component';
import { AdminIssuesComponent } from '../pages/admin-issues.component';
import { AdminFeedbacksComponent } from '../pages/admin-feedbacks.component';
import { authGuard } from '../../../core/guards/auth.guard';
import { roleGuard } from '../../../core/guards/role.guard';

export const adminRoutes: Routes = [
  {
    path: 'admin',
    component: AdminDashboardComponent,
    title: 'Admin Dashboard | Happy Lodging',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['admin'] },
  },
  {
    path: 'admin/rooms',
    component: AdminRoomManagementComponent,
    title: 'Manage Rooms | Happy Lodging',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['admin'] },
  },
  {
    path: 'admin/bookings',
    component: AdminAllBookingsComponent,
    title: 'All Bookings | Happy Lodging',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['admin'] },
  },
  {
    path: 'admin/issues',
    component: AdminIssuesComponent,
    title: 'Customer Issues | Happy Lodging',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['admin'] },
  },
  {
    path: 'admin/feedbacks',
    component: AdminFeedbacksComponent,
    title: 'Customer Feedback | Happy Lodging',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['admin'] },
  },
];
