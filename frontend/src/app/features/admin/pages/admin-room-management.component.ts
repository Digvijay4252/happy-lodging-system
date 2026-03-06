import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HotelService } from '../../../core/services/hotel.service';
import { ToastService } from '../../../core/services/toast.service';
import { ConfirmService } from '../../../core/services/confirm.service';
import { environment } from '../../../../environments/environment';

@Component({
  standalone: true,
  selector: 'app-admin-room-management',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './admin-room-management.component.html',
  styleUrl: './admin-room-management.component.scss',
})
export class AdminRoomManagementComponent implements OnInit {
  rooms: any[] = [];
  editingRoomId: number | null = null;
  showEditModal = false;
  selectedImageFile: File | null = null;
  imagePreviewUrl: string | null = null;
  isDragOver = false;
  editSelectedImageFile: File | null = null;
  editImagePreviewUrl: string | null = null;
  editDragOver = false;

  form = this.fb.group({
    room_number: ['', Validators.required],
    type: ['Single', Validators.required],
    price: [1000, [Validators.required, Validators.min(1)]],
    status: ['Available', Validators.required],
    description: [''],
    amenitiesText: [''],
  });

  editForm = this.fb.group({
    room_number: ['', Validators.required],
    type: ['Single', Validators.required],
    price: [1000, [Validators.required, Validators.min(1)]],
    status: ['Available', Validators.required],
    description: [''],
    amenitiesText: [''],
  });

  constructor(
    private fb: FormBuilder,
    private hotel: HotelService,
    private toast: ToastService,
    private confirm: ConfirmService
  ) {}

  resolveImageUrl(imageUrl: string): string {
    if (!imageUrl) return '';
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) return imageUrl;
    const base = environment.apiUrl.replace('/api', '');
    return `${base}${imageUrl}`;
  }

  ngOnInit() {
    this.loadRooms();
  }

  loadRooms() {
    this.hotel.listRooms().subscribe({
      next: (res) => (this.rooms = res.rooms || []),
      error: (err) => this.toast.error(err.error?.message || 'Failed to load rooms'),
    });
  }

  edit(room: any) {
    this.editingRoomId = room.id;
    this.editForm.patchValue({
      room_number: room.room_number,
      type: room.type,
      price: Number(room.price),
      status: room.status,
      description: room.description || '',
      amenitiesText: Array.isArray(room.amenities) ? room.amenities.join(', ') : '',
    });
    this.editSelectedImageFile = null;
    this.editImagePreviewUrl = null;
    this.editDragOver = false;
    if (room.images?.length) {
      this.editImagePreviewUrl = this.resolveImageUrl(room.images[0].image_url);
    }
    this.showEditModal = true;
  }

  resetForm() {
    this.form.reset({
      room_number: '',
      type: 'Single',
      price: 1000,
      status: 'Available',
      description: '',
      amenitiesText: '',
    });
    this.clearImageSelection();
  }

  save() {
    if (this.form.invalid) {
      this.toast.error('Please fill required fields correctly');
      return;
    }

    const { amenitiesText, ...rest } = this.form.value;
    const payload = {
      ...rest,
      amenities: (amenitiesText || '')
        .split(',')
        .map((a: string) => a.trim())
        .filter(Boolean),
    };

    this.hotel.createRoom(payload).subscribe({
      next: (res) => {
        const roomId = res?.room?.id;
        this.toast.success('Room created');
        if (roomId) {
          this.attachImageIfNeeded(roomId);
        } else {
          this.resetForm();
          this.loadRooms();
        }
      },
      error: (err) => this.toast.error(err.error?.message || 'Room creation failed'),
    });
  }

  private attachImageIfNeeded(roomId: number) {
    if (!this.selectedImageFile) {
      this.resetForm();
      this.loadRooms();
      return;
    }

    this.hotel.addRoomImageFile(roomId, this.selectedImageFile).subscribe({
      next: () => {
        this.toast.success('Room image added');
        this.resetForm();
        this.loadRooms();
      },
      error: (err) => {
        this.toast.error(err.error?.message || 'Room saved, but image upload failed');
        this.resetForm();
        this.loadRooms();
      },
    });
  }

  saveEditedRoom() {
    if (!this.editingRoomId) return;
    if (this.editForm.invalid) {
      this.toast.error('Please fill required fields correctly');
      return;
    }

    const { amenitiesText, ...rest } = this.editForm.value;
    const payload = {
      ...rest,
      amenities: (amenitiesText || '')
        .split(',')
        .map((a: string) => a.trim())
        .filter(Boolean),
    };

    this.hotel.updateRoom(this.editingRoomId, payload).subscribe({
      next: () => {
        if (!this.editSelectedImageFile) {
          this.toast.success('Room updated');
          this.closeEditModal();
          this.loadRooms();
          return;
        }
        this.hotel.addRoomImageFile(this.editingRoomId as number, this.editSelectedImageFile).subscribe({
          next: () => {
            this.toast.success('Room updated');
            this.closeEditModal();
            this.loadRooms();
          },
          error: (err) => {
            this.toast.error(err.error?.message || 'Room updated, but image upload failed');
            this.closeEditModal();
            this.loadRooms();
          },
        });
      },
      error: (err) => this.toast.error(err.error?.message || 'Room update failed'),
    });
  }

  remove(roomId: number) {
    this.confirm.ask('Are you sure you want to delete this room?', 'Delete Room').then((ok) => {
      if (!ok) return;
      this.hotel.deleteRoom(roomId).subscribe({
        next: () => {
          this.toast.success('Room deleted');
          this.loadRooms();
        },
        error: (err) => this.toast.error(err.error?.message || 'Room deletion failed'),
      });
    });
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = false;
    const file = event.dataTransfer?.files?.[0];
    this.setImageFile(file || null);
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] || null;
    this.setImageFile(file);
  }

  private setImageFile(file: File | null) {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      this.toast.error('Only image files are allowed');
      return;
    }
    this.selectedImageFile = file;
    this.imagePreviewUrl = URL.createObjectURL(file);
  }

  onEditDragOver(event: DragEvent) {
    event.preventDefault();
    this.editDragOver = true;
  }

  onEditDragLeave(event: DragEvent) {
    event.preventDefault();
    this.editDragOver = false;
  }

  onEditDrop(event: DragEvent) {
    event.preventDefault();
    this.editDragOver = false;
    const file = event.dataTransfer?.files?.[0] || null;
    this.setEditImageFile(file);
  }

  onEditFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] || null;
    this.setEditImageFile(file);
  }

  private setEditImageFile(file: File | null) {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      this.toast.error('Only image files are allowed');
      return;
    }
    this.editSelectedImageFile = file;
    this.editImagePreviewUrl = URL.createObjectURL(file);
  }

  clearImageSelection() {
    this.selectedImageFile = null;
    if (this.imagePreviewUrl) {
      URL.revokeObjectURL(this.imagePreviewUrl);
    }
    this.imagePreviewUrl = null;
  }

  clearEditImageSelection() {
    this.editSelectedImageFile = null;
    this.editImagePreviewUrl = null;
  }

  closeEditModal() {
    this.editingRoomId = null;
    this.showEditModal = false;
    this.editForm.reset({
      room_number: '',
      type: 'Single',
      price: 1000,
      status: 'Available',
      description: '',
      amenitiesText: '',
    });
    this.clearEditImageSelection();
  }
}
