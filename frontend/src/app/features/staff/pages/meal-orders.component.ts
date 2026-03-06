import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HotelService } from '../../../core/services/hotel.service';
import { ToastService } from '../../../core/services/toast.service';
import { AuthService } from '../../../core/services/auth.service';
import { ConfirmService } from '../../../core/services/confirm.service';

@Component({
  standalone: true,
  selector: 'app-meal-orders',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink],
  templateUrl: './meal-orders.component.html',
  styleUrl: './food-pages.shared.scss',
})
export class MealOrdersComponent implements OnInit {
  readonly orderStatuses: ('Placed' | 'Preparing' | 'Delivered' | 'Cancelled')[] = ['Placed', 'Preparing', 'Delivered', 'Cancelled'];
  mealOrders: any[] = [];

  filters = this.fb.group({
    q: [''],
    status: [''],
    order_date: [''],
    serving_type: [''],
  });

  constructor(
    private fb: FormBuilder,
    private hotel: HotelService,
    private toast: ToastService,
    private auth: AuthService,
    private confirm: ConfirmService
  ) {}

  ngOnInit(): void {
    this.loadOrders();
    this.filters.valueChanges.subscribe(() => this.loadOrders());
  }

  get isAdmin() {
    return this.auth.getRole() === 'admin';
  }

  get baseRoute() {
    return this.isAdmin ? '/admin/food' : '/staff/food';
  }

  get backRoute() {
    return this.isAdmin ? '/admin' : '/staff';
  }

  loadOrders() {
    this.hotel.mealOrders(this.filters.value).subscribe({
      next: (res) => (this.mealOrders = res.orders || []),
      error: (err) => this.toast.error(err.error?.message || 'Failed to load meal orders'),
    });
  }

  updateOrderStatus(orderId: number, status: 'Placed' | 'Preparing' | 'Delivered' | 'Cancelled') {
    this.confirm.ask(`Are you sure you want to change meal order status to "${status}"?`, 'Update Meal Order').then((ok) => {
      if (!ok) {
        this.loadOrders();
        return;
      }
      this.hotel.updateMealOrderStatus(orderId, status).subscribe({
        next: () => {
          this.toast.success('Order status updated');
          this.loadOrders();
        },
        error: (err) => this.toast.error(err.error?.message || 'Status update failed'),
      });
    });
  }
}
