import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HotelService } from '../../../core/services/hotel.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  standalone: true,
  selector: 'app-chatbot',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './chatbot.component.html',
  styleUrl: './chatbot.component.scss',
})
export class ChatbotComponent {
  message = '';
  messages: { role: string; text: string }[] = [];
  recommendations: any[] = [];
  aiProvider = 'mock';

  constructor(private hotel: HotelService, private auth: AuthService) {}

  ngOnInit() {
    this.hotel.aiStatus().subscribe({
      next: (res) => (this.aiProvider = res.provider || 'mock'),
      error: () => (this.aiProvider = 'mock'),
    });
  }

  get backRoute(): string {
    const role = this.auth.getRole();
    if (role === 'admin') return '/admin';
    if (role === 'staff') return '/staff';
    return '/customer';
  }

  send() {
    if (!this.message.trim()) return;
    const msg = this.message;
    this.messages.push({ role: 'You', text: msg });
    this.message = '';

    this.hotel.aiChat(msg).subscribe({
      next: (res) => this.messages.push({ role: 'AI', text: res.reply }),
      error: () => this.messages.push({ role: 'AI', text: 'AI service is unavailable right now.' }),
    });
  }

  recommend() {
    this.hotel.aiRecommendations().subscribe((res) => (this.recommendations = res.recommendations || []));
  }
}
