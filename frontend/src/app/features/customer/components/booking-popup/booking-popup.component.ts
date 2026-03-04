import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../../../environments/environment';
import { HotelService } from '../../../../core/services/hotel.service';
import { ToastService } from '../../../../core/services/toast.service';

type BookedRange = {
  id: number;
  booking_id: string;
  check_in: string;
  check_out: string;
  status: string;
};

@Component({
  selector: 'app-booking-popup',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './booking-popup.component.html',
  styleUrl: './booking-popup.component.scss',
})
export class BookingPopupComponent implements OnChanges {
  @Input() open = false;
  @Input() room: any | null = null;
  @Input() defaultCheckIn = '';
  @Input() defaultCheckOut = '';

  @Output() closed = new EventEmitter<void>();
  @Output() bookingConfirmed = new EventEmitter<void>();

  checkIn = '';
  checkOut = '';
  selectedType = '';
  currentRoom: any | null = null;
  bookedRanges: BookedRange[] = [];
  loading = false;
  submitting = false;

  constructor(
    private hotel: HotelService,
    private toast: ToastService
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if ((changes['open'] || changes['room']) && this.open && this.room?.id) {
      this.currentRoom = this.room;
      this.selectedType = this.room.type || '';
      this.checkIn = this.defaultCheckIn || '';
      this.checkOut = this.defaultCheckOut || '';
      this.fetchBookedDates();
    }
  }

  readonly roomTypes = ['Single', 'Double', 'Deluxe', 'Suite'];

  resolveImageUrl(imageUrl: string): string {
    if (!imageUrl) return '';
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) return imageUrl;
    const base = environment.apiUrl.replace('/api', '');
    return `${base}${imageUrl}`;
  }

  get minCheckIn(): string {
    return new Date().toISOString().split('T')[0];
  }

  get minCheckOut(): string {
    if (!this.checkIn) return this.minCheckIn;
    const next = new Date(this.checkIn);
    next.setDate(next.getDate() + 1);
    return next.toISOString().split('T')[0];
  }

  get nights(): number {
    if (!this.checkIn || !this.checkOut) return 0;
    const start = new Date(this.checkIn);
    const end = new Date(this.checkOut);
    const ms = end.getTime() - start.getTime();
    return ms > 0 ? Math.ceil(ms / (1000 * 60 * 60 * 24)) : 0;
  }

  get totalAmount(): number {
    if (!this.currentRoom) return 0;
    return this.nights * Number(this.currentRoom.price || 0);
  }

  get hasDateConflict(): boolean {
    if (!this.checkIn || !this.checkOut) return false;
    return this.bookedRanges.some((range) => this.isRangeOverlap(this.checkIn, this.checkOut, range.check_in, range.check_out));
  }

  onCheckInChange() {
    if (this.checkIn && this.isDateBlocked(this.checkIn)) {
      this.checkIn = '';
      this.toast.error('This start date is already booked for this room');
      return;
    }
    if (this.checkOut && this.checkOut <= this.checkIn) {
      this.checkOut = '';
    }
    if (this.checkIn && this.checkOut && this.hasDateConflict) {
      this.checkOut = '';
      this.toast.error('Selected range overlaps existing booking. Choose different dates.');
    }
  }

  onCheckOutChange() {
    if (!this.checkIn || !this.checkOut) return;
    if (this.checkOut <= this.checkIn) {
      this.checkOut = '';
      this.toast.error('Check-out must be after check-in');
      return;
    }
    if (this.hasDateConflict) {
      this.checkOut = '';
      this.toast.error('Selected range overlaps existing booking. Choose different dates.');
    }
  }

  close() {
    this.closed.emit();
  }

  confirmBooking() {
    if (!this.currentRoom?.id) return;
    if (!this.checkIn || !this.checkOut) {
      this.toast.info('Select check-in and check-out dates');
      return;
    }
    if (this.nights <= 0) {
      this.toast.error('Check-out date must be after check-in date');
      return;
    }
    if (this.hasDateConflict) {
      this.toast.error('Selected dates are not available');
      return;
    }

    this.submitting = true;
    this.hotel
      .createBooking({ room_id: this.currentRoom.id, check_in: this.checkIn, check_out: this.checkOut })
      .subscribe({
        next: () => {
          this.toast.success('Booking confirmed');
          this.submitting = false;
          this.bookingConfirmed.emit();
          this.close();
        },
        error: (err) => {
          this.submitting = false;
          this.toast.error(err.error?.message || 'Booking failed');
          this.fetchBookedDates();
        },
      });
  }

  private fetchBookedDates() {
    if (!this.currentRoom?.id) return;
    this.loading = true;
    this.hotel.roomBookedDates(this.currentRoom.id).subscribe({
      next: (res) => {
        this.bookedRanges = res.booked_ranges || [];
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.bookedRanges = [];
      },
    });
  }

  private isDateBlocked(dateStr: string): boolean {
    return this.bookedRanges.some((range) => dateStr >= range.check_in && dateStr < range.check_out);
  }

  private isRangeOverlap(startA: string, endA: string, startB: string, endB: string): boolean {
    return startA < endB && endA > startB;
  }

  onTypeChange() {
    if (!this.selectedType) return;
    const filters: any = { type: this.selectedType, status: 'Available' };
    if (this.checkIn && this.checkOut) {
      filters.checkIn = this.checkIn;
      filters.checkOut = this.checkOut;
    }

    this.hotel.listRooms(filters).subscribe({
      next: (res) => {
        const matched = (res.rooms || [])[0];
        if (!matched) {
          this.currentRoom = null;
          this.bookedRanges = [];
          this.toast.error(`No available ${this.selectedType} room for selected dates`);
          return;
        }
        this.currentRoom = matched;
        this.bookedRanges = [];
        this.fetchBookedDates();

        if (this.checkIn && this.isDateBlocked(this.checkIn)) {
          this.checkIn = '';
          this.checkOut = '';
        }
        if (this.checkIn && this.checkOut && this.hasDateConflict) {
          this.checkOut = '';
        }
      },
      error: () => this.toast.error('Failed to load rooms for selected type'),
    });
  }
}
