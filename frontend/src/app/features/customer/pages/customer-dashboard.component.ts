import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HotelService } from '../../../core/services/hotel.service';
import { ToastService } from '../../../core/services/toast.service';
import { environment } from '../../../../environments/environment';

@Component({
  standalone: true,
  selector: 'app-customer-dashboard',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './customer-dashboard.component.html',
  styleUrl: './customer-dashboard.component.scss',
})
export class CustomerDashboardComponent implements OnInit {
  rooms: any[] = [];

  filters = this.fb.group({
    checkIn: [''],
    checkOut: [''],
    type: [''],
    minPrice: [''],
    maxPrice: [''],
  });

  constructor(private fb: FormBuilder, private hotel: HotelService, private toast: ToastService) {}

  resolveImageUrl(imageUrl: string): string {
    if (!imageUrl) return '';
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) return imageUrl;
    const base = environment.apiUrl.replace('/api', '');
    return `${base}${imageUrl}`;
  }

  ngOnInit() {
    this.loadRooms();
  }

  loadRooms() {
    this.hotel.listRooms(this.filters.value).subscribe((res) => (this.rooms = res.rooms || []));
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
        },
        error: (err) => this.toast.error(err.error?.message || 'Booking failed'),
      });
  }
}
