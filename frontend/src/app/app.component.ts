import { Component, ElementRef, ViewChild } from '@angular/core';
import { filter } from 'rxjs/operators';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { ToastComponent } from './shared/components/toast/toast.component';
import { CommonModule } from '@angular/common';
import { AuthService } from './core/services/auth.service';
import { FormsModule } from '@angular/forms';
import { HotelService } from './core/services/hotel.service';
import { ConfirmService } from './core/services/confirm.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterOutlet, NavbarComponent, ToastComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  @ViewChild('aiScrollWrap') aiScrollWrap?: ElementRef<HTMLDivElement>;

  currentUrl = '';
  isAiOpen = false;
  aiInput = '';
  aiLoading = false;
  aiMessages: { role: 'AI' | 'You'; text: string }[] = [
    { role: 'AI', text: 'Hi, ask me about room types, prices, availability, or booking help.' },
  ];

  constructor(
    private router: Router,
    public auth: AuthService,
    private hotel: HotelService,
    public confirm: ConfirmService
  ) {
    this.currentUrl = this.router.url || '';
    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe((event: any) => {
      this.currentUrl = event.urlAfterRedirects || event.url || '';
    });
  }

  get showFloatingAiButton(): boolean {
    if (!this.auth.isLoggedIn()) return false;

    const url = (this.currentUrl || '').toLowerCase();
    const isAuthLogin = url.startsWith('/auth/login') || url === '/login' || url.startsWith('/login/');
    const isAuthSignup = url.startsWith('/auth/signup') || url === '/signup' || url.startsWith('/signup/');
    const isChatRoute = url.startsWith('/chatbot');
    return !isAuthLogin && !isAuthSignup && !isChatRoute;
  }

  openAiChat() {
    this.isAiOpen = !this.isAiOpen;
    if (this.isAiOpen) {
      setTimeout(() => this.scrollChatToBottom(), 0);
    }
  }

  closeAiChat() {
    this.isAiOpen = false;
  }

  sendAiMessage() {
    const text = this.aiInput.trim();
    if (!text || this.aiLoading) return;

    this.aiMessages.push({ role: 'You', text });
    this.scrollChatToBottom();
    this.aiInput = '';
    this.aiLoading = true;

    this.hotel.aiChat(text).subscribe({
      next: (res) => {
        this.aiMessages.push({ role: 'AI', text: res.reply || 'No response available.' });
        this.aiLoading = false;
        this.scrollChatToBottom();
      },
      error: () => {
        this.aiMessages.push({ role: 'AI', text: 'AI service is unavailable right now.' });
        this.aiLoading = false;
        this.scrollChatToBottom();
      },
    });
  }

  private scrollChatToBottom() {
    setTimeout(() => {
      const el = this.aiScrollWrap?.nativeElement;
      if (!el) return;
      el.scrollTop = el.scrollHeight;
    }, 0);
  }
}
