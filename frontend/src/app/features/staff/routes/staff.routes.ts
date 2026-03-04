import { Routes } from '@angular/router';
import { StaffDashboardComponent } from '../pages/staff-dashboard.component';
import { StaffOperationsComponent } from '../pages/staff-operations.component';
import { StaffTicketsComponent } from '../pages/staff-tickets.component';
import { authGuard } from '../../../core/guards/auth.guard';
import { roleGuard } from '../../../core/guards/role.guard';

export const staffRoutes: Routes = [
  {
    path: 'staff',
    component: StaffDashboardComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['staff', 'admin'] },
  },
  {
    path: 'staff/operations',
    component: StaffOperationsComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['staff', 'admin'] },
  },
  {
    path: 'staff/tickets',
    component: StaffTicketsComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['staff', 'admin'] },
  },
];
