import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { RoomStatusComponent } from '../components/room-status/room-status.component';

@Component({
  standalone: true,
  selector: 'app-staff-room-status',
  imports: [CommonModule, RouterLink, RoomStatusComponent],
  templateUrl: './staff-room-status.component.html',
  styleUrl: './staff-room-status.component.scss',
})
export class StaffRoomStatusComponent {}

