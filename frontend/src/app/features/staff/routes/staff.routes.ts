import { Routes } from '@angular/router';
import { StaffDashboardComponent } from '../pages/staff-dashboard.component';
import { StaffOperationsComponent } from '../pages/staff-operations.component';
import { StaffTicketsComponent } from '../pages/staff-tickets.component';
import { StaffFeedbacksComponent } from '../pages/staff-feedbacks.component';
import { StaffBookingOpsPage } from '../pages/staff-booking-ops.page';
import { StaffRoomStatusPage } from '../pages/staff-room-status.page';
import { authGuard } from '../../../core/guards/auth.guard';
import { roleGuard } from '../../../core/guards/role.guard';

export const staffRoutes: Routes = [
  {
    path: 'staff',
    component: StaffDashboardComponent,
    title: 'Staff Dashboard | Happy Lodging',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['staff', 'admin'] },
  },
  {
    path: 'staff/operations',
    component: StaffOperationsComponent,
    title: 'Staff Operations | Happy Lodging',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['staff', 'admin'] },
  },
  {
    path: 'staff/booking-ops',
    component: StaffBookingOpsPage,
    title: 'Booking Operations | Happy Lodging',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['staff', 'admin'] },
  },
  {
    path: 'staff/room-status',
    component: StaffRoomStatusPage,
    title: 'Room Status | Happy Lodging',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['staff', 'admin'] },
  },
  {
    path: 'staff/tickets',
    component: StaffTicketsComponent,
    title: 'Service Tickets | Happy Lodging',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['staff', 'admin'] },
  },
  {
    path: 'staff/feedbacks',
    component: StaffFeedbacksComponent,
    title: 'Customer Feedback | Happy Lodging',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['staff', 'admin'] },
  },
];
