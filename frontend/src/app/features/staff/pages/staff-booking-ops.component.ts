import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BookingOpsComponent } from '../components/booking-ops/booking-ops.component';

@Component({
  standalone: true,
  selector: 'app-staff-booking-ops',
  imports: [CommonModule, RouterLink, BookingOpsComponent],
  templateUrl: './staff-booking-ops.component.html',
  styleUrl: './staff-booking-ops.component.scss',
})
export class StaffBookingOpsComponent {}

