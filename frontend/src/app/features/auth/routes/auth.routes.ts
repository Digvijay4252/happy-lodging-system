import { Routes } from '@angular/router';
import { CustomerLoginComponent } from '../pages/customer-login.component';
import { StaffLoginComponent } from '../pages/staff-login.component';
import { AdminLoginComponent } from '../pages/admin-login.component';
import { CustomerSignupComponent } from '../pages/customer-signup.component';
import { StaffSignupComponent } from '../pages/staff-signup.component';
import { AdminSignupComponent } from '../pages/admin-signup.component';

export const authRoutes: Routes = [
  // Common pasted/legacy auth URL aliases
  { path: 'auth', redirectTo: 'auth/login/customer', pathMatch: 'full' },
  { path: 'auth/login', redirectTo: 'auth/login/customer', pathMatch: 'full' },
  { path: 'login', redirectTo: 'auth/login/customer', pathMatch: 'full' },
  { path: 'login/customer', redirectTo: 'auth/login/customer', pathMatch: 'full' },
  { path: 'login/staff', redirectTo: 'auth/login/staff', pathMatch: 'full' },
  { path: 'login/admin', redirectTo: 'auth/login/admin', pathMatch: 'full' },

  { path: 'auth/signup', redirectTo: 'auth/signup/customer', pathMatch: 'full' },
  { path: 'signup', redirectTo: 'auth/signup/customer', pathMatch: 'full' },
  { path: 'signup/customer', redirectTo: 'auth/signup/customer', pathMatch: 'full' },
  { path: 'signup/staff', redirectTo: 'auth/signup/staff', pathMatch: 'full' },
  { path: 'signup/admin', redirectTo: 'auth/signup/admin', pathMatch: 'full' },

  { path: 'auth/register', redirectTo: 'auth/signup/customer', pathMatch: 'full' },
  { path: 'register', redirectTo: 'auth/signup/customer', pathMatch: 'full' },

  { path: 'auth/login/customer', component: CustomerLoginComponent },
  { path: 'auth/login/staff', component: StaffLoginComponent },
  { path: 'auth/login/admin', component: AdminLoginComponent },
  { path: 'auth/signup/admin', component: AdminSignupComponent },
  { path: 'auth/signup/customer', component: CustomerSignupComponent },
  { path: 'auth/signup/staff', component: StaffSignupComponent },
];
