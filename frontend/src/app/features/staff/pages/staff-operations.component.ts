import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HotelService } from '../../../core/services/hotel.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  standalone: true,
  selector: 'app-staff-operations',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './staff-operations.component.html',
  styleUrl: './staff-operations.component.scss',
})
export class StaffOperationsComponent {
  bookingId = this.fb.control<string>('');

  roomForm = this.fb.group({
    roomId: [null],
    status: ['Available'],
  });

  constructor(private fb: FormBuilder, private hotel: HotelService, private toast: ToastService) {}

  checkIn() {
    const id = (this.bookingId.value || '').trim();
    if (!id) return;
    this.hotel.checkIn(id).subscribe({
      next: () => this.toast.success('Checked in'),
      error: (err) => this.toast.error(err.error?.message || 'Check-in failed'),
    });
  }

  checkOut() {
    const id = (this.bookingId.value || '').trim();
    if (!id) return;
    this.hotel.checkOut(id).subscribe({
      next: () => this.toast.success('Checked out'),
      error: (err) => this.toast.error(err.error?.message || 'Check-out failed'),
    });
  }

  updateRoom() {
    const { roomId, status } = this.roomForm.value;
    if (!roomId || !status) return;
    this.hotel.updateRoomStatus(roomId, status).subscribe({
      next: () => this.toast.success('Room status updated'),
      error: (err) => this.toast.error(err.error?.message || 'Room update failed'),
    });
  }
}
