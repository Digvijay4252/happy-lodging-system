import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DashboardCardsComponent } from '../../../shared/components/dashboard-cards/dashboard-cards.component';
import { HotelService } from '../../../core/services/hotel.service';

@Component({
  standalone: true,
  selector: 'app-admin-dashboard',
  imports: [CommonModule, DashboardCardsComponent, RouterLink],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss',
})
export class AdminDashboardComponent implements OnInit {
  cards: any[] = [];
  bookings: any[] = [];
  reports: any = {};

  constructor(private hotel: HotelService) {}

  ngOnInit() {
    this.hotel.adminDashboard().subscribe((res) => {
      this.cards = [
        { label: 'Total Bookings', value: res.totalBookings },
        { label: 'Total Revenue', value: res.totalRevenue },
        { label: 'Occupancy Rate', value: `${res.occupancyRate}%` },
        { label: 'Available Rooms', value: res.availableRoomsCount },
      ];
    });

    this.hotel.adminBookings().subscribe((res) => (this.bookings = res.bookings || []));
    this.hotel.adminReports().subscribe((res) => (this.reports = res));
  }

  changeStatus(id: number, status: string) {
    this.hotel.updateBookingStatus(id, status).subscribe();
  }
}
