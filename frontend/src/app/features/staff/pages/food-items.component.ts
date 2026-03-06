import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HotelService } from '../../../core/services/hotel.service';
import { ToastService } from '../../../core/services/toast.service';
import { AuthService } from '../../../core/services/auth.service';
import { ConfirmService } from '../../../core/services/confirm.service';
import { environment } from '../../../../environments/environment';

@Component({
  standalone: true,
  selector: 'app-food-items',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './food-items.component.html',
  styleUrl: './food-pages.shared.scss',
})
export class FoodItemsComponent implements OnInit {
  readonly categories = ['Veg', 'NonVeg', 'Vegan', 'Dessert', 'Beverage', 'Other'];
  foodItems: any[] = [];
  editingFoodId: number | null = null;
  showEditModal = false;
  selectedImageFile: File | null = null;
  imagePreviewUrl = '';
  dragOver = false;
  editSelectedImageFile: File | null = null;
  editImagePreviewUrl = '';
  editDragOver = false;

  foodForm = this.fb.group({
    name: ['', Validators.required],
    description: [''],
    category: ['Veg', Validators.required],
    price: [0, [Validators.required, Validators.min(1)]],
    image_url: [''],
    is_active: [true],
  });

  editFoodForm = this.fb.group({
    name: ['', Validators.required],
    description: [''],
    category: ['Veg', Validators.required],
    price: [0, [Validators.required, Validators.min(1)]],
    image_url: [''],
    is_active: [true],
  });

  constructor(
    private fb: FormBuilder,
    private hotel: HotelService,
    private toast: ToastService,
    private auth: AuthService,
    private confirm: ConfirmService
  ) {}

  ngOnInit(): void {
    this.loadFoodItems();
  }

  get isAdmin() {
    return this.auth.getRole() === 'admin';
  }

  get baseRoute() {
    return this.isAdmin ? '/admin/food' : '/staff/food';
  }

  get backRoute() {
    return this.isAdmin ? '/admin' : '/staff';
  }

  loadFoodItems() {
    this.hotel.listFoodItems().subscribe({
      next: (res) => (this.foodItems = res.items || []),
      error: (err) => this.toast.error(err.error?.message || 'Failed to load food items'),
    });
  }

  saveFood() {
    if (this.foodForm.invalid) {
      this.foodForm.markAllAsTouched();
      return;
    }
    const payload = this.foodForm.getRawValue();
    this.hotel.createFoodItem(payload).subscribe({
      next: (res) => {
        const itemId = Number(res?.item?.id || 0);
        if (itemId && this.selectedImageFile) {
          this.hotel.addFoodItemImageFile(itemId, this.selectedImageFile).subscribe({
            next: () => {
              this.toast.success('Food item created');
              this.resetAddForm();
              this.loadFoodItems();
            },
            error: (err) => this.toast.error(err.error?.message || 'Food saved, but image upload failed'),
          });
          return;
        }
        this.toast.success('Food item created');
        this.resetAddForm();
        this.loadFoodItems();
      },
      error: (err) => this.toast.error(err.error?.message || 'Food save failed'),
    });
  }

  editFood(item: any) {
    this.editingFoodId = item.id;
    this.editFoodForm.patchValue({
      name: item.name,
      description: item.description || '',
      category: item.category,
      price: Number(item.price || 0),
      image_url: item.image_url || '',
      is_active: !!item.is_active,
    });
    this.editImagePreviewUrl = item.image_url || '';
    this.editSelectedImageFile = null;
    this.showEditModal = true;
  }

  closeEditModal() {
    this.editingFoodId = null;
    this.showEditModal = false;
    this.editFoodForm.reset({
      name: '',
      description: '',
      category: 'Veg',
      price: 0,
      image_url: '',
      is_active: true,
    });
    this.editSelectedImageFile = null;
    this.editImagePreviewUrl = '';
    this.editDragOver = false;
  }

  saveEditedFood() {
    if (!this.editingFoodId) return;
    if (this.editFoodForm.invalid) {
      this.editFoodForm.markAllAsTouched();
      return;
    }
    const payload = this.editFoodForm.getRawValue();
    this.hotel.updateFoodItem(this.editingFoodId, payload).subscribe({
      next: (res) => {
        const itemId = Number(res?.item?.id || this.editingFoodId || 0);
        if (itemId && this.editSelectedImageFile) {
          this.hotel.addFoodItemImageFile(itemId, this.editSelectedImageFile).subscribe({
            next: () => {
              this.toast.success('Food item updated');
              this.closeEditModal();
              this.loadFoodItems();
            },
            error: (err) => this.toast.error(err.error?.message || 'Food saved, but image upload failed'),
          });
          return;
        }
        this.toast.success('Food item updated');
        this.closeEditModal();
        this.loadFoodItems();
      },
      error: (err) => this.toast.error(err.error?.message || 'Food update failed'),
    });
  }

  resetAddForm() {
    this.foodForm.reset({
      name: '',
      description: '',
      category: 'Veg',
      price: 0,
      image_url: '',
      is_active: true,
    });
    this.selectedImageFile = null;
    this.imagePreviewUrl = '';
    this.dragOver = false;
  }

  deleteFood(id: number) {
    this.confirm.ask('Are you sure you want to delete this food item?', 'Delete Food Item').then((ok) => {
      if (!ok) return;
      this.hotel.deleteFoodItem(id).subscribe({
        next: () => {
          this.toast.success('Food item deleted');
          this.loadFoodItems();
        },
        error: (err) => this.toast.error(err.error?.message || 'Delete failed'),
      });
    });
  }

  pickFile(input: HTMLInputElement) {
    input.click();
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.setImageFile(file);
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.dragOver = false;
    const file = event.dataTransfer?.files?.[0];
    if (!file) return;
    this.setImageFile(file);
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.dragOver = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    this.dragOver = false;
  }

  removeSelectedImage() {
    this.selectedImageFile = null;
    this.imagePreviewUrl = '';
    this.foodForm.patchValue({ image_url: '' });
  }

  pickEditFile(input: HTMLInputElement) {
    input.click();
  }

  onEditFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.setEditImageFile(file);
  }

  onEditDrop(event: DragEvent) {
    event.preventDefault();
    this.editDragOver = false;
    const file = event.dataTransfer?.files?.[0];
    if (!file) return;
    this.setEditImageFile(file);
  }

  onEditDragOver(event: DragEvent) {
    event.preventDefault();
    this.editDragOver = true;
  }

  onEditDragLeave(event: DragEvent) {
    event.preventDefault();
    this.editDragOver = false;
  }

  removeEditSelectedImage() {
    this.editSelectedImageFile = null;
    this.editImagePreviewUrl = '';
    this.editFoodForm.patchValue({ image_url: '' });
  }

  private setImageFile(file: File) {
    if (!file.type.startsWith('image/')) {
      this.toast.error('Only image files are allowed');
      return;
    }
    this.selectedImageFile = file;
    this.imagePreviewUrl = URL.createObjectURL(file);
    this.foodForm.patchValue({ image_url: '' });
  }

  private setEditImageFile(file: File) {
    if (!file.type.startsWith('image/')) {
      this.toast.error('Only image files are allowed');
      return;
    }
    this.editSelectedImageFile = file;
    this.editImagePreviewUrl = URL.createObjectURL(file);
    this.editFoodForm.patchValue({ image_url: '' });
  }

  resolveImageUrl(imageUrl: string): string {
    const clean = String(imageUrl || '').trim();
    if (!clean) return '';
    if (clean.startsWith('blob:')) return clean;
    if (clean.startsWith('http://') || clean.startsWith('https://')) {
      if (clean.includes('images.unsplash.com') && !clean.includes('?')) {
        return `${clean}?auto=format&fit=crop&w=320&q=80`;
      }
      return clean;
    }
    const base = environment.apiUrl.replace('/api', '');
    return `${base}${clean}`;
  }

  onImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    if (!img) return;
    if (img.dataset.fallbackApplied === 'true') return;
    img.dataset.fallbackApplied = 'true';
    img.src =
      "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='80' viewBox='0 0 120 80'><rect width='120' height='80' fill='%23e5e7eb'/><text x='60' y='44' text-anchor='middle' font-size='12' fill='%236b7280' font-family='Arial, sans-serif'>No Image</text></svg>";
  }
}
