import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HotelService } from '../../../core/services/hotel.service';
import { ToastService } from '../../../core/services/toast.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  standalone: true,
  selector: 'app-daily-meal-menu-planner',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './daily-meal-menu-planner.component.html',
  styleUrl: './food-pages.shared.scss',
})
export class DailyMealMenuPlannerComponent implements OnInit {
  readonly mealSlots: ('Breakfast' | 'Lunch' | 'Dinner')[] = ['Breakfast', 'Lunch', 'Dinner'];
  foodItems: any[] = [];
  menus: any[] = [];

  menuForm = this.fb.group({
    menu_date: ['', Validators.required],
    meal_slot: ['Breakfast' as 'Breakfast' | 'Lunch' | 'Dinner', Validators.required],
    food_item_ids: [[] as number[], Validators.required],
  });

  constructor(
    private fb: FormBuilder,
    private hotel: HotelService,
    private toast: ToastService,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    this.loadFoodItems();
    this.loadMenus();
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
    this.hotel.listFoodItems({ activeOnly: true }).subscribe({
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
}
