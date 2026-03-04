import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-ticket-update-popup',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ticket-update-popup.component.html',
  styleUrl: './ticket-update-popup.component.scss',
})
export class TicketUpdatePopupComponent implements OnChanges {
  @Input() open = false;
  @Input() ticket: any | null = null;
  @Input() saving = false;

  @Output() closed = new EventEmitter<void>();
  @Output() saved = new EventEmitter<{ status: string; assigned_staff_id?: number }>();

  status = 'Open';
  assignedStaffId: number | null = null;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['ticket'] && this.ticket) {
      this.status = this.ticket.status || 'Open';
      this.assignedStaffId = this.ticket.assigned_staff_id || this.ticket.assigned_staff?.id || null;
    }
  }

  close() {
    this.closed.emit();
  }

  save() {
    this.saved.emit({
      status: this.status,
      assigned_staff_id: this.assignedStaffId || undefined,
    });
  }
}

