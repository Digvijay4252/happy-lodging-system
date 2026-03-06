import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HotelService } from '../../../core/services/hotel.service';
import { ToastService } from '../../../core/services/toast.service';
import { ConfirmService } from '../../../core/services/confirm.service';
import { environment } from '../../../../environments/environment';

@Component({
  standalone: true,
  selector: 'app-admin-all-bookings',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './admin-all-bookings.component.html',
  styleUrl: './admin-all-bookings.component.scss',
})
export class AdminAllBookingsComponent implements OnInit {
  viewMode: 'tiles' | 'table' = 'tiles';
  bookings: any[] = [];
  selectedBooking: any | null = null;
  showBookingPopup = false;
  popupStatus = 'Booked';

  constructor(
    private hotel: HotelService,
    private toast: ToastService,
    private confirm: ConfirmService
  ) {}

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
    this.confirm.ask(`Are you sure you want to change booking status to "${status}"?`, 'Update Booking Status').then((ok) => {
      if (!ok) return;
      this.hotel.updateBookingStatus(id, status).subscribe({
        next: () => {
          this.toast.success('Booking status updated');
          this.loadBookings();
        },
        error: (err) => this.toast.error(err.error?.message || 'Status update failed'),
      });
    });
  }

  setViewMode(mode: 'tiles' | 'table') {
    this.viewMode = mode;
  }

  openDetails(booking: any) {
    this.selectedBooking = booking;
    this.popupStatus = booking.status || 'Booked';
    this.showBookingPopup = true;
  }

  closeDetails() {
    this.showBookingPopup = false;
  }

  updateFromPopup() {
    if (!this.selectedBooking) return;
    if ((this.selectedBooking.status || '') === this.popupStatus) {
      this.closeDetails();
      return;
    }
    this.changeStatus(this.selectedBooking.id, this.popupStatus);
    this.closeDetails();
  }

  statusClass(status: string): string {
    if (status === 'Booked') return 'status-booked';
    if (status === 'CheckedIn') return 'status-in';
    if (status === 'CheckedOut') return 'status-out';
    if (status === 'Cancelled') return 'status-cancelled';
    return '';
  }
}
