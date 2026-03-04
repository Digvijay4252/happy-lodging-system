import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HotelService } from '../../../core/services/hotel.service';

@Component({
  standalone: true,
  selector: 'app-chatbot',
  imports: [CommonModule, FormsModule],
  templateUrl: './chatbot.component.html',
  styleUrl: './chatbot.component.scss',
})
export class ChatbotComponent {
  message = '';
  messages: { role: string; text: string }[] = [];
  recommendations: any[] = [];

  constructor(private hotel: HotelService) {}

  send() {
    if (!this.message.trim()) return;
    const msg = this.message;
    this.messages.push({ role: 'You', text: msg });
    this.message = '';

    this.hotel.aiChat(msg).subscribe((res) => {
      this.messages.push({ role: 'AI', text: res.reply });
    });
  }

  recommend() {
    this.hotel.aiRecommendations().subscribe((res) => (this.recommendations = res.recommendations || []));
  }
}
