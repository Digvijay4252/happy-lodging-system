import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { HotelService } from '../../../core/services/hotel.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  standalone: true,
  selector: 'app-staff-dashboard',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './staff-dashboard.component.html',
  styleUrl: './staff-dashboard.component.scss',
})
export class StaffDashboardComponent implements OnInit {
  bookingId = this.fb.control<number | null>(null);

  roomForm = this.fb.group({
    roomId: [null],
    status: ['Available'],
  });

  ticketForm = this.fb.group({
    booking_id: [null],
    description: [''],
  });

  tickets: any[] = [];

  constructor(private fb: FormBuilder, private hotel: HotelService, private toast: ToastService) {}

  ngOnInit() {
    this.loadTickets();
  }

  checkIn() {
    const id = this.bookingId.value;
    if (!id) return;
    this.hotel.checkIn(id).subscribe({
      next: () => this.toast.success('Checked in'),
      error: (err) => this.toast.error(err.error?.message || 'Check-in failed'),
    });
  }

  checkOut() {
    const id = this.bookingId.value;
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

  createTicket() {
    this.hotel.createTicket(this.ticketForm.value).subscribe({
      next: () => {
        this.toast.success('Service ticket created');
        this.ticketForm.reset({ booking_id: null, description: '' });
        this.loadTickets();
      },
      error: (err) => this.toast.error(err.error?.message || 'Ticket creation failed'),
    });
  }

  loadTickets() {
    this.hotel.serviceTickets().subscribe((res) => (this.tickets = res.tickets || []));
  }
}
