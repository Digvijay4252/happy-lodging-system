import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BookingOpsComponent } from '../components/booking-ops/booking-ops.component';
import { RoomStatusComponent } from '../components/room-status/room-status.component';

@Component({
  standalone: true,
  selector: 'app-staff-operations',
  imports: [CommonModule, RouterLink, BookingOpsComponent, RoomStatusComponent],
  templateUrl: './staff-operations.component.html',
  styleUrl: './staff-operations.component.scss',
})
export class StaffOperationsComponent {}
