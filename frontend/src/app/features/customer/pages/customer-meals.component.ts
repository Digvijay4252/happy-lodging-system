import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HotelService } from '../../../core/services/hotel.service';
import { ToastService } from '../../../core/services/toast.service';
import { ConfirmService } from '../../../core/services/confirm.service';
import { environment } from '../../../../environments/environment';

@Component({
  standalone: true,
  selector: 'app-customer-meals',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './customer-meals.component.html',
  styleUrl: './customer-meals.component.scss',
})
export class CustomerMealsComponent implements OnInit {
  readonly mealSlots: ('Breakfast' | 'Lunch' | 'Dinner')[] = ['Breakfast', 'Lunch', 'Dinner'];
  readonly servingModes: ('DineIn' | 'Takeaway' | 'RoomDelivery')[] = ['DineIn', 'Takeaway', 'RoomDelivery'];

  activeBookings: any[] = [];
  myOrders: any[] = [];
  availableDates: string[] = [];
  menuItems: any[] = [];
  itemQty: Record<number, number> = {};

  form = this.fb.group({
    booking_id: [null as number | null, Validators.required],
    order_date: ['', Validators.required],
    meal_slot: ['Breakfast' as 'Breakfast' | 'Lunch' | 'Dinner', Validators.required],
    serving_type: ['DineIn' as 'DineIn' | 'Takeaway' | 'RoomDelivery', Validators.required],
    notes: [''],
  });

  constructor(
    private fb: FormBuilder,
    private hotel: HotelService,
    private toast: ToastService,
    private confirm: ConfirmService
  ) {}

  ngOnInit(): void {
    this.loadBookings();
    this.loadOrders();
    this.form.controls.booking_id.valueChanges.subscribe((id) => this.onBookingChange(id));
    this.form.controls.order_date.valueChanges.subscribe(() => this.loadMenuItems());
    this.form.controls.meal_slot.valueChanges.subscribe(() => this.loadMenuItems());
  }

  loadBookings() {
    this.hotel.myBookings().subscribe({
      next: (res) => {
        this.activeBookings = (res.bookings || []).filter((b: any) => !['Cancelled', 'CheckedOut'].includes(b.status));
        if (this.activeBookings.length && !this.form.value.booking_id) {
          const firstId = Number(this.activeBookings[0].id);
          this.form.patchValue({ booking_id: firstId });
          this.onBookingChange(firstId);
        }
      },
      error: (err) => this.toast.error(err.error?.message || 'Failed to load bookings'),
    });
  }

  loadOrders() {
    this.hotel.myMealOrders().subscribe({
      next: (res) => (this.myOrders = res.orders || []),
      error: (err) => this.toast.error(err.error?.message || 'Failed to load meal orders'),
    });
  }

  onBookingChange(bookingId: number | null) {
    this.availableDates = [];
    this.form.patchValue({ order_date: '' });
    this.menuItems = [];
    this.itemQty = {};

    if (!bookingId) return;
    const booking = this.activeBookings.find((b) => b.id === Number(bookingId));
    if (!booking) return;

    const start = new Date(`${booking.check_in}T00:00:00`);
    const end = new Date(`${booking.check_out}T00:00:00`);
    const dates: string[] = [];
    for (const d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      dates.push(this.toLocalDateString(d));
    }
    this.availableDates = dates;
    if (this.availableDates.length) {
      this.form.patchValue({ order_date: this.availableDates[0] });
    }
  }

  loadMenuItems() {
    const date = this.form.value.order_date;
    const slot = this.form.value.meal_slot;
    if (!date || !slot) return;

    this.hotel.getMenuForDateSlot(date, slot).subscribe({
      next: (res) => {
        this.menuItems = res.items || [];
        this.itemQty = {};
        this.menuItems.forEach((item: any) => (this.itemQty[item.id] = 0));
        if (!this.menuItems.length) this.toast.info('No menu found for selected date and slot');
      },
      error: (err) => this.toast.error(err.error?.message || 'Failed to load menu'),
    });
  }

  incQty(foodId: number) {
    this.itemQty[foodId] = Number(this.itemQty[foodId] || 0) + 1;
  }

  decQty(foodId: number) {
    this.itemQty[foodId] = Math.max(0, Number(this.itemQty[foodId] || 0) - 1);
  }

  get totalAmount() {
    return this.menuItems.reduce((sum, item) => sum + Number(item.price) * Number(this.itemQty[item.id] || 0), 0);
  }

  submitOrder() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toast.error('Select booking, date, slot and serving mode');
      return;
    }
    const items = Object.entries(this.itemQty)
      .filter(([, qty]) => Number(qty) > 0)
      .map(([food_item_id, qty]) => ({ food_item_id: Number(food_item_id), qty: Number(qty) }));
    if (!items.length) {
      this.toast.error('Select at least one dish');
      return;
    }

    const payload = {
      ...this.form.getRawValue(),
      items,
    };

    this.hotel.placeMealOrder(payload).subscribe({
      next: () => {
        this.toast.success('Meal order placed');
        this.itemQty = {};
        this.menuItems.forEach((item) => (this.itemQty[item.id] = 0));
        this.loadOrders();
      },
      error: (err) => this.toast.error(err.error?.message || 'Meal order failed'),
    });
  }

  cancelOrder(orderId: number) {
    this.confirm.ask('Are you sure you want to cancel this meal order?', 'Cancel Meal Order').then((ok) => {
      if (!ok) return;
      this.hotel.cancelMyMealOrder(orderId).subscribe({
        next: () => {
          this.toast.success('Meal order cancelled');
          this.loadOrders();
        },
        error: (err) => this.toast.error(err.error?.message || 'Cancel failed'),
      });
    });
  }

  private toLocalDateString(value: Date) {
    const y = value.getFullYear();
    const m = String(value.getMonth() + 1).padStart(2, '0');
    const d = String(value.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  resolveImageUrl(imageUrl: string): string {
    const clean = String(imageUrl || '').trim();
    if (!clean) return '';
    if (clean.startsWith('blob:')) return clean;
    if (clean.startsWith('http://') || clean.startsWith('https://')) {
      if (clean.includes('images.unsplash.com') && !clean.includes('?')) {
        return `${clean}?auto=format&fit=crop&w=320&q=80`;
      }
      return clean;
    }
    const base = environment.apiUrl.replace('/api', '');
    return `${base}${clean}`;
  }

  onImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    if (!img) return;
    if (img.dataset.fallbackApplied === 'true') return;
    img.dataset.fallbackApplied = 'true';
    img.src =
      "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='80' viewBox='0 0 120 80'><rect width='120' height='80' fill='%23e5e7eb'/><text x='60' y='44' text-anchor='middle' font-size='12' fill='%236b7280' font-family='Arial, sans-serif'>No Image</text></svg>";
  }
}
