import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Subject, debounceTime, takeUntil } from 'rxjs';
import { HotelService } from '../../../../core/services/hotel.service';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-booking-ops',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './booking-ops.component.html',
  styleUrl: './booking-ops.component.scss',
})
export class BookingOpsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  viewMode: 'tiles' | 'table' = 'tiles';

  bookings: any[] = [];
  selectedBooking: any | null = null;
  showActionModal = false;

  filters = this.fb.group({
    q: [''],
    status: [''],
    checkInFrom: [''],
    checkInTo: [''],
  });

  constructor(
    private fb: FormBuilder,
    private hotel: HotelService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.loadBookings();
    this.filters.valueChanges.pipe(debounceTime(300), takeUntil(this.destroy$)).subscribe(() => this.loadBookings());
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadBookings() {
    this.hotel.staffBookings(this.filters.value).subscribe({
      next: (res) => (this.bookings = res.bookings || []),
      error: (err) => this.toast.error(err.error?.message || 'Failed to load bookings'),
    });
  }

  useBooking(booking: any) {
    this.selectedBooking = booking;
    this.showActionModal = true;
  }

  closeModal() {
    this.showActionModal = false;
  }

  get bookingStats() {
    const stats = { total: 0, booked: 0, checkedIn: 0, checkedOut: 0, cancelled: 0 };
    for (const b of this.bookings) {
      stats.total += 1;
      if (b.status === 'Booked') stats.booked += 1;
      if (b.status === 'CheckedIn') stats.checkedIn += 1;
      if (b.status === 'CheckedOut') stats.checkedOut += 1;
      if (b.status === 'Cancelled') stats.cancelled += 1;
    }
    return stats;
  }

  statusClass(status: string): string {
    if (status === 'Booked') return 'status-booked';
    if (status === 'CheckedIn') return 'status-in';
    if (status === 'CheckedOut') return 'status-out';
    if (status === 'Cancelled') return 'status-cancelled';
    return '';
  }

  setViewMode(mode: 'tiles' | 'table') {
    this.viewMode = mode;
  }

  checkIn() {
    const id = (this.selectedBooking?.booking_id || this.selectedBooking?.id || '').toString().trim();
    if (!id) {
      this.toast.info('Select a booking first');
      return;
    }
    this.hotel.checkIn(id).subscribe({
      next: () => {
        this.toast.success('Checked in');
        this.closeModal();
        this.loadBookings();
      },
      error: (err) => this.toast.error(err.error?.message || 'Check-in failed'),
    });
  }

  checkOut() {
    const id = (this.selectedBooking?.booking_id || this.selectedBooking?.id || '').toString().trim();
    if (!id) {
      this.toast.info('Select a booking first');
      return;
    }
    this.hotel.checkOut(id).subscribe({
      next: () => {
        this.toast.success('Checked out');
        this.closeModal();
        this.loadBookings();
      },
      error: (err) => this.toast.error(err.error?.message || 'Check-out failed'),
    });
  }
}
