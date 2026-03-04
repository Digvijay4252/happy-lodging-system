import { Routes } from '@angular/router';
import { authRoutes } from './features/auth/routes/auth.routes';
import { customerRoutes } from './features/customer/routes/customer.routes';
import { adminRoutes } from './features/admin/routes/admin.routes';
import { staffRoutes } from './features/staff/routes/staff.routes';
import { chatbotRoutes } from './features/chatbot/routes/chatbot.routes';

export const routes: Routes = [
  { path: '', redirectTo: 'auth/login/customer', pathMatch: 'full' },
  ...authRoutes,
  ...customerRoutes,
  ...adminRoutes,
  ...staffRoutes,
  ...chatbotRoutes,
  { path: '**', redirectTo: 'auth/login/customer' },
];
