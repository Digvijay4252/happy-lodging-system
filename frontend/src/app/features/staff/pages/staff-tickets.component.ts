import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HotelService } from '../../../core/services/hotel.service';
import { ToastService } from '../../../core/services/toast.service';
import { ConfirmService } from '../../../core/services/confirm.service';
import { TicketUpdatePopupComponent } from '../components/ticket-update-popup/ticket-update-popup.component';

@Component({
  standalone: true,
  selector: 'app-staff-tickets',
  imports: [CommonModule, ReactiveFormsModule, RouterLink, TicketUpdatePopupComponent],
  templateUrl: './staff-tickets.component.html',
  styleUrl: './staff-tickets.component.scss',
})
export class StaffTicketsComponent implements OnInit {
  viewMode: 'tiles' | 'table' = 'tiles';
  ticketForm = this.fb.group({
    booking_id: [null],
    description: [''],
  });
  filters = this.fb.group({
    q: [''],
    status: [''],
    from: [''],
    to: [''],
  });

  tickets: any[] = [];
  bookings: any[] = [];
  selectedTicket: any | null = null;
  showTicketPopup = false;
  saving = false;

  constructor(
    private fb: FormBuilder,
    private hotel: HotelService,
    private toast: ToastService,
    private confirm: ConfirmService
  ) {}

  ngOnInit() {
    this.loadTickets();
    this.loadBookingsForDropdown();
    this.filters.valueChanges.subscribe(() => {
      // trigger change detection for filtered list
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

  updateTicket(ticketId: number, status: string, assignedStaffId?: number) {
    this.confirm.ask(`Are you sure you want to set ticket status to "${status}"?`, 'Update Ticket Status').then((ok) => {
      if (!ok) return;
      const payload: any = { status };
      if (assignedStaffId) payload.assigned_staff_id = Number(assignedStaffId);

      this.saving = true;
      this.hotel.updateTicket(ticketId, payload).subscribe({
        next: () => {
          this.toast.success('Ticket updated');
          this.saving = false;
          this.closeTicketPopup();
          this.loadTickets();
        },
        error: (err) => {
          this.saving = false;
          this.toast.error(err.error?.message || 'Ticket update failed');
        },
      });
    });
  }

  loadTickets() {
    this.hotel.serviceTickets().subscribe({
      next: (res) => (this.tickets = res.tickets || []),
      error: (err) => this.toast.error(err.error?.message || 'Failed to load tickets'),
    });
  }

  loadBookingsForDropdown() {
    this.hotel.staffBookings({ status: 'Booked,CheckedIn' }).subscribe({
      next: (res) => {
        this.bookings = res.bookings || [];
      },
      error: () => {
        this.bookings = [];
      },
    });
  }

  get filteredTickets() {
    const { q, status, from, to } = this.filters.value;
    return this.tickets.filter((t) => {
      const textOk =
        !q ||
        String(t.id).includes(String(q)) ||
        String(t.booking_id).includes(String(q)) ||
        String(t.description || '')
          .toLowerCase()
          .includes(String(q).toLowerCase()) ||
        String(t.assigned_staff?.name || '')
          .toLowerCase()
          .includes(String(q).toLowerCase());

      const statusOk = !status || t.status === status;
      const created = new Date(t.createdAt || t.created_at || t.updatedAt || Date.now());
      const fromOk = !from || created >= new Date(from);
      const toDate = to ? new Date(to) : null;
      if (toDate) toDate.setHours(23, 59, 59, 999);
      const toOk = !toDate || created <= toDate;

      return textOk && statusOk && fromOk && toOk;
    });
  }

  openTicketPopup(ticket: any) {
    this.selectedTicket = ticket;
    this.showTicketPopup = true;
  }

  closeTicketPopup() {
    this.showTicketPopup = false;
  }

  setViewMode(mode: 'tiles' | 'table') {
    this.viewMode = mode;
  }

  statusClass(status: string): string {
    if (status === 'Open') return 'status-open';
    if (status === 'InProgress') return 'status-progress';
    if (status === 'Resolved') return 'status-resolved';
    if (status === 'Closed') return 'status-closed';
    return '';
  }
}
