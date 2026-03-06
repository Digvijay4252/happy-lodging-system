import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HotelService } from '../../../core/services/hotel.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  standalone: true,
  selector: 'app-staff-feedbacks',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './staff-feedbacks.component.html',
  styleUrl: './staff-feedbacks.component.scss',
})
export class StaffFeedbacksComponent implements OnInit {
  readonly feedbackTypes = ['Service', 'Cleanliness', 'Room', 'Food', 'Facilities', 'Other'];
  feedbacks: any[] = [];
  filters = this.fb.group({
    q: [''],
    sentiment: [''],
    feedback_type: [''],
  });

  constructor(
    private fb: FormBuilder,
    private hotel: HotelService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.load();
    this.filters.valueChanges.subscribe(() => this.load());
  }

  load() {
    this.hotel.staffFeedbacks(this.filters.value).subscribe({
      next: (res) => (this.feedbacks = res.feedbacks || []),
      error: (err) => this.toast.error(err.error?.message || 'Failed to load feedback'),
    });
  }
}

