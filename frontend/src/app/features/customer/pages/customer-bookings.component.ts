import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HotelService } from '../../../core/services/hotel.service';
import { ToastService } from '../../../core/services/toast.service';
import { environment } from '../../../../environments/environment';

@Component({
  standalone: true,
  selector: 'app-customer-bookings',
  imports: [CommonModule, RouterLink],
  templateUrl: './customer-bookings.component.html',
  styleUrl: './customer-bookings.component.scss',
})
export class CustomerBookingsComponent implements OnInit {
  bookings: any[] = [];

  constructor(private hotel: HotelService, private toast: ToastService) {}

  ngOnInit() {
    this.loadBookings();
  }

  resolveImageUrl(imageUrl: string): string {
    if (!imageUrl) return '';
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) return imageUrl;
    const base = environment.apiUrl.replace('/api', '');
    return `${base}${imageUrl}`;
  }

  loadBookings() {
    this.hotel.myBookings().subscribe({
      next: (res) => (this.bookings = res.bookings || []),
      error: (err) => this.toast.error(err.error?.message || 'Failed to load bookings'),
    });
  }

  cancel(id: number) {
    this.hotel.cancelBooking(id).subscribe({
      next: () => {
        this.toast.success('Booking cancelled');
        this.loadBookings();
      },
      error: (err) => this.toast.error(err.error?.message || 'Cancel failed'),
    });
  }

  pay(id: number) {
    this.hotel.payBooking(id).subscribe({
      next: () => {
        this.toast.success('Payment processed');
        this.loadBookings();
      },
      error: (err) => this.toast.error(err.error?.message || 'Payment failed'),
    });
  }
}
