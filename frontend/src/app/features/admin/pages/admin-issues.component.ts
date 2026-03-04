import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HotelService } from '../../../core/services/hotel.service';
import { ToastService } from '../../../core/services/toast.service';
import { TicketUpdatePopupComponent } from '../../staff/components/ticket-update-popup/ticket-update-popup.component';

@Component({
  standalone: true,
  selector: 'app-admin-issues',
  imports: [CommonModule, ReactiveFormsModule, RouterLink, TicketUpdatePopupComponent],
  templateUrl: './admin-issues.component.html',
  styleUrl: './admin-issues.component.scss',
})
export class AdminIssuesComponent implements OnInit {
  viewMode: 'tiles' | 'table' = 'tiles';
  tickets: any[] = [];
  selectedTicket: any | null = null;
  showTicketPopup = false;
  saving = false;

  filters = this.fb.group({
    q: [''],
    status: [''],
    from: [''],
    to: [''],
  });

  constructor(
    private fb: FormBuilder,
    private hotel: HotelService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.loadTickets();
  }

  loadTickets() {
    this.hotel.serviceTickets().subscribe({
      next: (res) => (this.tickets = res.tickets || []),
      error: (err) => this.toast.error(err.error?.message || 'Failed to load issues'),
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

  updateTicket(ticketId: number, status: string, assignedStaffId?: number) {
    const payload: any = { status };
    if (assignedStaffId) payload.assigned_staff_id = Number(assignedStaffId);

    this.saving = true;
    this.hotel.updateTicket(ticketId, payload).subscribe({
      next: () => {
        this.toast.success('Issue updated');
        this.saving = false;
        this.closeTicketPopup();
        this.loadTickets();
      },
      error: (err) => {
        this.saving = false;
        this.toast.error(err.error?.message || 'Issue update failed');
      },
    });
  }
}
