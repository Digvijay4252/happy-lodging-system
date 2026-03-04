import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HotelService } from '../../../core/services/hotel.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  standalone: true,
  selector: 'app-staff-tickets',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './staff-tickets.component.html',
  styleUrl: './staff-tickets.component.scss',
})
export class StaffTicketsComponent implements OnInit {
  ticketForm = this.fb.group({
    booking_id: [null],
    description: [''],
  });

  tickets: any[] = [];

  constructor(private fb: FormBuilder, private hotel: HotelService, private toast: ToastService) {}

  ngOnInit() {
    this.loadTickets();
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

  updateTicket(ticketId: number, status: string, assignedStaffId?: number) {
    const payload: any = { status };
    if (assignedStaffId) payload.assigned_staff_id = Number(assignedStaffId);

    this.hotel.updateTicket(ticketId, payload).subscribe({
      next: () => {
        this.toast.success('Ticket updated');
        this.loadTickets();
      },
      error: (err) => this.toast.error(err.error?.message || 'Ticket update failed'),
    });
  }

  loadTickets() {
    this.hotel.serviceTickets().subscribe({
      next: (res) => (this.tickets = res.tickets || []),
      error: (err) => this.toast.error(err.error?.message || 'Failed to load tickets'),
    });
  }
}
