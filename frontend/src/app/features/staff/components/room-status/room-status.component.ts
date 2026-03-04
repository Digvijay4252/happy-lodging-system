import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Subject, debounceTime, takeUntil } from 'rxjs';
import { HotelService } from '../../../../core/services/hotel.service';
import { ToastService } from '../../../../core/services/toast.service';
import { RoomStatusPopupComponent } from '../room-status-popup/room-status-popup.component';

@Component({
  selector: 'app-room-status',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RoomStatusPopupComponent],
  templateUrl: './room-status.component.html',
  styleUrl: './room-status.component.scss',
})
export class RoomStatusComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  viewMode: 'tiles' | 'table' = 'tiles';

  rooms: any[] = [];
  selectedRoom: any | null = null;
  showUpdateModal = false;
  selectedRoomStatus = 'Available';
  saving = false;

  filters = this.fb.group({
    q: [''],
    status: [''],
  });

  constructor(
    private fb: FormBuilder,
    private hotel: HotelService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.loadRooms();
    this.filters.valueChanges.pipe(debounceTime(300), takeUntil(this.destroy$)).subscribe(() => this.loadRooms());
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadRooms() {
    this.hotel.staffRooms(this.filters.value).subscribe({
      next: (res) => (this.rooms = res.rooms || []),
      error: (err) => this.toast.error(err.error?.message || 'Failed to load rooms'),
    });
  }

  useRoom(room: any) {
    this.selectedRoom = room;
    this.selectedRoomStatus = room.status || 'Available';
    this.showUpdateModal = true;
  }

  closeModal() {
    this.showUpdateModal = false;
  }

  setViewMode(mode: 'tiles' | 'table') {
    this.viewMode = mode;
  }

  statusClass(status: string): string {
    if (status === 'Available') return 'status-available';
    if (status === 'Occupied') return 'status-occupied';
    if (status === 'Cleaning') return 'status-cleaning';
    if (status === 'Maintenance') return 'status-maintenance';
    return '';
  }

  updateRoom(newStatus?: string) {
    const roomId = this.selectedRoom?.id;
    const status = newStatus || this.selectedRoomStatus;
    if (!roomId || !status) {
      this.toast.info('Select room and status');
      return;
    }
    this.saving = true;
    this.hotel.updateRoomStatus(roomId, status).subscribe({
      next: () => {
        this.toast.success('Room status updated');
        this.saving = false;
        this.closeModal();
        this.loadRooms();
      },
      error: (err) => {
        this.saving = false;
        this.toast.error(err.error?.message || 'Room update failed');
      },
    });
  }
}
