import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'info' | 'warn' | 'error';
export interface Toast {
  id: number;
  type: ToastType;
  text: string;
  duration: number;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly _toasts = signal<Toast[]>([]);
  private _id = 1;

  readonly toasts = this._toasts.asReadonly();

  push(type: ToastType, text: string, duration = 3000) {
    const toast: Toast = { id: this._id++, type, text, duration };
    this._toasts.update(list => [toast, ...list]);
    setTimeout(() => this.dismiss(toast.id), duration);
  }

  dismiss(id: number) {
    this._toasts.update(list => list.filter(t => t.id !== id));
  }

  success(text: string, duration = 3000) {
    this.push('success', text, duration);
  }

  error(text: string, duration = 5000) {
    this.push('error', text, duration);
  }
}
