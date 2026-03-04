import { Routes } from '@angular/router';
import { ChatbotComponent } from '../pages/chatbot.component';
import { authGuard } from '../../../core/guards/auth.guard';

export const chatbotRoutes: Routes = [
  {
    path: 'chatbot',
    component: ChatbotComponent,
    title: 'Chatbot | Happy Lodging',
    canActivate: [authGuard],
  },
];
