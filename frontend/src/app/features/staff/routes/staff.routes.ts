import { Routes } from '@angular/router';
import { StaffDashboardComponent } from '../pages/staff-dashboard.component';
import { authGuard } from '../../../core/guards/auth.guard';
import { roleGuard } from '../../../core/guards/role.guard';

export const staffRoutes: Routes = [
  {
    path: 'staff',
    component: StaffDashboardComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['staff', 'admin'] },
  },
];
