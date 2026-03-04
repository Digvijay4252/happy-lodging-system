import { Routes } from '@angular/router';
import { SessionRedirectComponent } from './core/components/session-redirect/session-redirect.component';
import { authRoutes } from './features/auth/routes/auth.routes';
import { customerRoutes } from './features/customer/routes/customer.routes';
import { adminRoutes } from './features/admin/routes/admin.routes';
import { staffRoutes } from './features/staff/routes/staff.routes';
import { chatbotRoutes } from './features/chatbot/routes/chatbot.routes';

export const routes: Routes = [
  { path: '', component: SessionRedirectComponent, pathMatch: 'full', title: 'Happy Lodging' },
  ...authRoutes,
  ...customerRoutes,
  ...adminRoutes,
  ...staffRoutes,
  ...chatbotRoutes,
  { path: '**', component: SessionRedirectComponent, title: 'Happy Lodging' },
];
