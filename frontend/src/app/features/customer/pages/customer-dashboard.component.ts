import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { HotelService } from '../../../core/services/hotel.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  standalone: true,
  selector: 'app-customer-dashboard',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './customer-dashboard.component.html',
  styleUrl: './customer-dashboard.component.scss',
})
export class CustomerDashboardComponent implements OnInit {
  rooms: any[] = [];
  bookings: any[] = [];

  filters = this.fb.group({
    checkIn: [''],
    checkOut: [''],
    type: [''],
    minPrice: [''],
    maxPrice: [''],
  });

  constructor(private fb: FormBuilder, private hotel: HotelService, private toast: ToastService) {}

  ngOnInit() {
    this.loadRooms();
    this.loadBookings();
  }

  loadRooms() {
    this.hotel.listRooms(this.filters.value).subscribe((res) => (this.rooms = res.rooms || []));
  }

  loadBookings() {
    this.hotel.myBookings().subscribe((res) => (this.bookings = res.bookings || []));
  }

  book(roomId: number) {
    const { checkIn, checkOut } = this.filters.value;
    if (!checkIn || !checkOut) {
      this.toast.info('Select check-in and check-out dates');
      return;
    }

    this.hotel
      .createBooking({ room_id: roomId, check_in: checkIn, check_out: checkOut })
      .subscribe({
        next: () => {
          this.toast.success('Booking confirmed');
          this.loadBookings();
        },
        error: (err) => this.toast.error(err.error?.message || 'Booking failed'),
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
