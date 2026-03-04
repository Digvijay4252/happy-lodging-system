import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HotelService } from '../../../core/services/hotel.service';
import { environment } from '../../../../environments/environment';
import { Subject, debounceTime, takeUntil } from 'rxjs';
import { BookingPopupComponent } from '../components/booking-popup/booking-popup.component';

@Component({
  standalone: true,
  selector: 'app-customer-dashboard',
  imports: [CommonModule, ReactiveFormsModule, RouterLink, BookingPopupComponent],
  templateUrl: './customer-dashboard.component.html',
  styleUrl: './customer-dashboard.component.scss',
})
export class CustomerDashboardComponent implements OnInit, OnDestroy {
  rooms: any[] = [];
  selectedRoom: any | null = null;
  showBookingModal = false;
  private destroy$ = new Subject<void>();

  filters = this.fb.group({
    checkIn: [''],
    checkOut: [''],
    type: [''],
    minPrice: [''],
    maxPrice: [''],
  });

  constructor(private fb: FormBuilder, private hotel: HotelService) {}

  resolveImageUrl(imageUrl: string): string {
    if (!imageUrl) return '';
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) return imageUrl;
    const base = environment.apiUrl.replace('/api', '');
    return `${base}${imageUrl}`;
  }

  ngOnInit() {
    this.loadRooms();

    this.filters.valueChanges
      .pipe(debounceTime(300), takeUntil(this.destroy$))
      .subscribe(() => this.loadRooms());
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadRooms() {
    this.hotel.listRooms(this.filters.value).subscribe((res) => (this.rooms = res.rooms || []));
  }

  openBookingModal(room: any) {
    this.selectedRoom = room;
    this.showBookingModal = true;
  }

  closeBookingModal() {
    this.showBookingModal = false;
    this.selectedRoom = null;
  }
}
