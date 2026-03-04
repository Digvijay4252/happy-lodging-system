import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HotelService } from '../../../core/services/hotel.service';
import { ToastService } from '../../../core/services/toast.service';
import { environment } from '../../../../environments/environment';

@Component({
  standalone: true,
  selector: 'app-admin-all-bookings',
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-all-bookings.component.html',
  styleUrl: './admin-all-bookings.component.scss',
})
export class AdminAllBookingsComponent implements OnInit {
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
    this.hotel.adminBookings().subscribe({
      next: (res) => (this.bookings = res.bookings || []),
      error: (err) => this.toast.error(err.error?.message || 'Failed to load bookings'),
    });
  }

  changeStatus(id: number, status: string) {
    this.hotel.updateBookingStatus(id, status).subscribe({
      next: () => {
        this.toast.success('Booking status updated');
        this.loadBookings();
      },
      error: (err) => this.toast.error(err.error?.message || 'Status update failed'),
    });
  }
}
