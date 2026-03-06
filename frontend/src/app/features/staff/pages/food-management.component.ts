import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HotelService } from '../../../core/services/hotel.service';
import { ToastService } from '../../../core/services/toast.service';
import { AuthService } from '../../../core/services/auth.service';
import { ConfirmService } from '../../../core/services/confirm.service';

@Component({
  standalone: true,
  selector: 'app-food-management',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink],
  templateUrl: './food-management.component.html',
  styleUrl: './food-management.component.scss',
})
export class FoodManagementComponent implements OnInit {
  readonly mealSlots: ('Breakfast' | 'Lunch' | 'Dinner')[] = ['Breakfast', 'Lunch', 'Dinner'];
  readonly orderStatuses: ('Placed' | 'Preparing' | 'Delivered' | 'Cancelled')[] = ['Placed', 'Preparing', 'Delivered', 'Cancelled'];

  foodItems: any[] = [];
  menus: any[] = [];
  mealOrders: any[] = [];
  editingFoodId: number | null = null;

  foodForm = this.fb.group({
    name: ['', Validators.required],
    description: [''],
    category: ['Veg', Validators.required],
    price: [0, [Validators.required, Validators.min(1)]],
    image_url: [''],
    is_active: [true],
  });

  menuForm = this.fb.group({
    menu_date: ['', Validators.required],
    meal_slot: ['Breakfast' as 'Breakfast' | 'Lunch' | 'Dinner', Validators.required],
    food_item_ids: [[] as number[], Validators.required],
  });

  orderFilters = this.fb.group({
    q: [''],
    status: [''],
    order_date: [''],
    serving_type: [''],
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
    this.loadMenus();
    this.loadOrders();
    this.orderFilters.valueChanges.subscribe(() => this.loadOrders());
  }

  get isAdmin() {
    return this.auth.getRole() === 'admin';
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

  loadMenus() {
    this.hotel.listDailyMealMenus({ date_from: this.menuForm.value.menu_date || '' }).subscribe({
      next: (res) => (this.menus = res.menus || []),
      error: (err) => this.toast.error(err.error?.message || 'Failed to load menus'),
    });
  }

  loadOrders() {
    this.hotel.mealOrders(this.orderFilters.value).subscribe({
      next: (res) => (this.mealOrders = res.orders || []),
      error: (err) => this.toast.error(err.error?.message || 'Failed to load meal orders'),
    });
  }

  saveFood() {
    if (this.foodForm.invalid) {
      this.foodForm.markAllAsTouched();
      return;
    }
    const payload = this.foodForm.getRawValue();
    const req$ = this.editingFoodId
      ? this.hotel.updateFoodItem(this.editingFoodId, payload)
      : this.hotel.createFoodItem(payload);
    req$.subscribe({
      next: () => {
        this.toast.success(this.editingFoodId ? 'Food item updated' : 'Food item created');
        this.cancelEditFood();
        this.loadFoodItems();
      },
      error: (err) => this.toast.error(err.error?.message || 'Food save failed'),
    });
  }

  editFood(item: any) {
    this.editingFoodId = item.id;
    this.foodForm.patchValue({
      name: item.name,
      description: item.description || '',
      category: item.category,
      price: Number(item.price || 0),
      image_url: item.image_url || '',
      is_active: !!item.is_active,
    });
  }

  cancelEditFood() {
    this.editingFoodId = null;
    this.foodForm.reset({
      name: '',
      description: '',
      category: 'Veg',
      price: 0,
      image_url: '',
      is_active: true,
    });
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

  toggleFoodSelection(foodId: number, checked: boolean) {
    const current = new Set(this.menuForm.value.food_item_ids || []);
    if (checked) current.add(foodId);
    else current.delete(foodId);
    this.menuForm.patchValue({ food_item_ids: [...current] });
  }

  hasFoodSelected(foodId: number) {
    return (this.menuForm.value.food_item_ids || []).includes(foodId);
  }

  saveMenu() {
    if (this.menuForm.invalid || !(this.menuForm.value.food_item_ids || []).length) {
      this.toast.error('Select date, meal slot and at least one dish');
      return;
    }
    this.hotel.upsertDailyMealMenu(this.menuForm.getRawValue() as any).subscribe({
      next: () => {
        this.toast.success('Daily menu saved');
        this.loadMenus();
      },
      error: (err) => this.toast.error(err.error?.message || 'Menu save failed'),
    });
  }

  carryForward() {
    const date = this.menuForm.value.menu_date;
    if (!date) {
      this.toast.error('Select a date for carry-forward');
      return;
    }
    this.hotel.carryForwardMenu(date).subscribe({
      next: () => {
        this.toast.success('Carry-forward completed');
        this.loadMenus();
      },
      error: (err) => this.toast.error(err.error?.message || 'Carry-forward failed'),
    });
  }

  updateOrderStatus(orderId: number, status: 'Placed' | 'Preparing' | 'Delivered' | 'Cancelled') {
    this.confirm.ask(`Are you sure you want to change meal order status to "${status}"?`, 'Update Meal Order').then((ok) => {
      if (!ok) {
        this.loadOrders();
        return;
      }
      this.hotel.updateMealOrderStatus(orderId, status).subscribe({
        next: () => {
          this.toast.success('Order status updated');
          this.loadOrders();
        },
        error: (err) => this.toast.error(err.error?.message || 'Status update failed'),
      });
    });
  }
}
