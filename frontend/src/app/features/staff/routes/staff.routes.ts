import { Routes } from '@angular/router';
import { StaffDashboardComponent } from '../pages/staff-dashboard.component';
import { StaffOperationsComponent } from '../pages/staff-operations.component';
import { StaffTicketsComponent } from '../pages/staff-tickets.component';
import { StaffFeedbacksComponent } from '../pages/staff-feedbacks.component';
import { StaffBookingOpsComponent } from '../pages/staff-booking-ops.component';
import { StaffRoomStatusComponent } from '../pages/staff-room-status.component';
import { FoodItemsComponent } from '../pages/food-items.component';
import { DailyMealMenuPlannerComponent } from '../pages/daily-meal-menu-planner.component';
import { MealOrdersComponent } from '../pages/meal-orders.component';
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
    component: StaffBookingOpsComponent,
    title: 'Booking Operations | Happy Lodging',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['staff', 'admin'] },
  },
  {
    path: 'staff/room-status',
    component: StaffRoomStatusComponent,
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
  {
    path: 'staff/food',
    redirectTo: 'staff/food/items',
    pathMatch: 'full',
  },
  {
    path: 'staff/food/items',
    component: FoodItemsComponent,
    title: 'Food Management | Happy Lodging',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['staff', 'admin'] },
  },
  {
    path: 'staff/food/menus',
    component: DailyMealMenuPlannerComponent,
    title: 'Daily Meal Menu Planner | Happy Lodging',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['staff', 'admin'] },
  },
  {
    path: 'staff/food/orders',
    component: MealOrdersComponent,
    title: 'Meal Orders | Happy Lodging',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['staff', 'admin'] },
  },
];
