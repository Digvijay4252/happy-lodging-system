import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { ToastMessage, ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast.component.html',
  styleUrl: './toast.component.scss',
})
export class ToastComponent implements OnInit, OnDestroy {
  toasts: ToastMessage[] = [];
  private sub?: Subscription;

  constructor(private toast: ToastService) {}

  ngOnInit() {
    this.sub = this.toast.messages$.subscribe((message) => {
      this.toasts = [...this.toasts, message];
      setTimeout(() => this.dismiss(message.id), message.duration || 3000);
    });
  }

  dismiss(id: number) {
    this.toasts = this.toasts.filter((t) => t.id !== id);
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }
}
