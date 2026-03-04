import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: number;
  text: string;
  type: ToastType;
  duration?: number;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private stream = new Subject<ToastMessage>();
  messages$ = this.stream.asObservable();

  private emit(text: string, type: ToastType, duration = 3000) {
    this.stream.next({ id: Date.now() + Math.floor(Math.random() * 1000), text, type, duration });
  }

  success(text: string, duration?: number) {
    this.emit(text, 'success', duration);
  }

  error(text: string, duration?: number) {
    this.emit(text, 'error', duration);
  }

  info(text: string, duration?: number) {
    this.emit(text, 'info', duration);
  }
}
