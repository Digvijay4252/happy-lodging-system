import { Routes } from '@angular/router';
import { AdminDashboardComponent } from '../pages/admin-dashboard.component';
import { AdminRoomManagementComponent } from '../pages/admin-room-management.component';
import { AdminAllBookingsComponent } from '../pages/admin-all-bookings.component';
import { AdminIssuesComponent } from '../pages/admin-issues.component';
import { AdminFeedbacksComponent } from '../pages/admin-feedbacks.component';
import { FoodItemsComponent } from '../../staff/pages/food-items.component';
import { DailyMealMenuPlannerComponent } from '../../staff/pages/daily-meal-menu-planner.component';
import { MealOrdersComponent } from '../../staff/pages/meal-orders.component';
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
  {
    path: 'admin/food',
    redirectTo: 'admin/food/items',
    pathMatch: 'full',
  },
  {
    path: 'admin/food/items',
    component: FoodItemsComponent,
    title: 'Food Management | Happy Lodging',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['admin'] },
  },
  {
    path: 'admin/food/menus',
    component: DailyMealMenuPlannerComponent,
    title: 'Daily Meal Menu Planner | Happy Lodging',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['admin'] },
  },
  {
    path: 'admin/food/orders',
    component: MealOrdersComponent,
    title: 'Meal Orders | Happy Lodging',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['admin'] },
  },
];
