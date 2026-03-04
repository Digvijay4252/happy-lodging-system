import { Routes } from '@angular/router';
import { AdminDashboardComponent } from '../pages/admin-dashboard.component';
import { AdminRoomManagementComponent } from '../pages/admin-room-management.component';
import { AdminAllBookingsComponent } from '../pages/admin-all-bookings.component';
import { authGuard } from '../../../core/guards/auth.guard';
import { roleGuard } from '../../../core/guards/role.guard';

export const adminRoutes: Routes = [
  {
    path: 'admin',
    component: AdminDashboardComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['admin'] },
  },
  {
    path: 'admin/rooms',
    component: AdminRoomManagementComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['admin'] },
  },
  {
    path: 'admin/bookings',
    component: AdminAllBookingsComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['admin'] },
  },
];
