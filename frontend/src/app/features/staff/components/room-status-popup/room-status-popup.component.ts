import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-room-status-popup',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './room-status-popup.component.html',
  styleUrl: './room-status-popup.component.scss',
})
export class RoomStatusPopupComponent implements OnChanges {
  @Input() open = false;
  @Input() room: any | null = null;
  @Input() status = 'Available';
  @Input() saving = false;

  @Output() closed = new EventEmitter<void>();
  @Output() saved = new EventEmitter<string>();

  localStatus = 'Available';

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['status']) {
      this.localStatus = this.status || 'Available';
    }
  }

  close() {
    this.closed.emit();
  }

  save() {
    this.saved.emit(this.localStatus);
  }
}

