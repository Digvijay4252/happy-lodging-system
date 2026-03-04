import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { RoomStatusComponent } from '../components/room-status/room-status.component';

@Component({
  standalone: true,
  selector: 'app-staff-room-status-page',
  imports: [CommonModule, RouterLink, RoomStatusComponent],
  template: `
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h3 class="section-title mb-0">Update Room Status</h3>
      <a class="btn btn-outline-secondary" routerLink="/staff">Back to Staff Home</a>
    </div>
    <app-room-status></app-room-status>
  `,
})
export class StaffRoomStatusPage {}

