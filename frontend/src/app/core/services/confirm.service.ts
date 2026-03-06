import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface ConfirmDialogState {
  title: string;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class ConfirmService {
  private resolver: ((value: boolean) => void) | null = null;
  private dialogSubject = new BehaviorSubject<ConfirmDialogState | null>(null);
  readonly dialog$ = this.dialogSubject.asObservable();

  ask(message: string, title = 'Confirm Action'): Promise<boolean> {
    if (this.resolver) {
      this.resolver(false);
      this.resolver = null;
    }

    this.dialogSubject.next({ title, message });
    return new Promise<boolean>((resolve) => {
      this.resolver = resolve;
    });
  }

  confirm() {
    if (this.resolver) this.resolver(true);
    this.cleanup();
  }

  cancel() {
    if (this.resolver) this.resolver(false);
    this.cleanup();
  }

  private cleanup() {
    this.resolver = null;
    this.dialogSubject.next(null);
  }
}
