import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HotelService } from '../../../core/services/hotel.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  standalone: true,
  selector: 'app-admin-feedbacks',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './admin-feedbacks.component.html',
  styleUrl: './admin-feedbacks.component.scss',
})
export class AdminFeedbacksComponent implements OnInit {
  readonly feedbackTypes = ['Service', 'Cleanliness', 'Room', 'Food', 'Facilities', 'Other'];
  viewMode: 'tiles' | 'table' = 'tiles';
  feedbacks: any[] = [];
  selectedFeedback: any | null = null;
  showFeedbackPopup = false;
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
    this.hotel.adminFeedbacks(this.filters.value).subscribe({
      next: (res) => (this.feedbacks = res.feedbacks || []),
      error: (err) => this.toast.error(err.error?.message || 'Failed to load feedback'),
    });
  }

  setViewMode(mode: 'tiles' | 'table') {
    this.viewMode = mode;
  }

  openDetails(feedback: any) {
    this.selectedFeedback = feedback;
    this.showFeedbackPopup = true;
  }

  closeDetails() {
    this.showFeedbackPopup = false;
  }

  sentimentClass(sentiment: string): string {
    if (sentiment === 'positive') return 'sent-positive';
    if (sentiment === 'negative') return 'sent-negative';
    return 'sent-neutral';
  }
}
