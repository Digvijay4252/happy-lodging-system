import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HotelService } from '../../../core/services/hotel.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  standalone: true,
  selector: 'app-customer-feedback',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink],
  templateUrl: './customer-feedback.component.html',
  styleUrl: './customer-feedback.component.scss',
})
export class CustomerFeedbackComponent implements OnInit {
  readonly feedbackTypes = ['Service', 'Cleanliness', 'Room', 'Food', 'Facilities', 'Other'];
  bookings: any[] = [];
  feedbacks: any[] = [];
  selectedFeedbackTypeFilter = '';

  form = this.fb.group({
    booking_id: [null as number | null, Validators.required],
    feedback_type: ['Service', Validators.required],
    comment: ['', [Validators.required, Validators.minLength(3)]],
  });

  constructor(
    private fb: FormBuilder,
    private hotel: HotelService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.loadEligibleBookings();
    this.loadFeedbacks();
  }

  loadEligibleBookings() {
    this.hotel.myBookings().subscribe({
      next: (res) => {
        this.bookings = (res.bookings || []).filter((b: any) => b.status === 'CheckedOut');
      },
      error: (err) => this.toast.error(err.error?.message || 'Failed to load bookings'),
    });
  }

  loadFeedbacks() {
    this.hotel.myFeedbacks({ feedback_type: this.selectedFeedbackTypeFilter }).subscribe({
      next: (res) => (this.feedbacks = res.feedbacks || []),
      error: (err) => this.toast.error(err.error?.message || 'Failed to load feedback'),
    });
  }

  onTypeFilterChange(value: string) {
    this.selectedFeedbackTypeFilter = value;
    this.loadFeedbacks();
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toast.error('Please select booking and enter at least 3 characters in feedback.');
      return;
    }
    this.hotel
      .submitFeedback(this.form.getRawValue() as { booking_id: number; comment: string; feedback_type: string })
      .subscribe({
      next: () => {
        this.toast.success('Feedback submitted');
        this.form.reset({ booking_id: null, feedback_type: 'Service', comment: '' });
        this.loadFeedbacks();
      },
      error: (err) => this.toast.error(err.error?.message || 'Feedback submit failed'),
      });
  }
}

