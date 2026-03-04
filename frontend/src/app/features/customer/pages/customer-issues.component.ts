import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HotelService } from '../../../core/services/hotel.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  standalone: true,
  selector: 'app-customer-issues',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './customer-issues.component.html',
  styleUrl: './customer-issues.component.scss',
})
export class CustomerIssuesComponent implements OnInit {
  bookings: any[] = [];
  issues: any[] = [];

  issueForm = this.fb.group({
    booking_id: [null as number | null, Validators.required],
    description: ['', [Validators.required, Validators.minLength(5)]],
  });

  constructor(
    private fb: FormBuilder,
    private hotel: HotelService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.loadBookings();
    this.loadIssues();
  }

  loadBookings() {
    this.hotel.myBookings().subscribe({
      next: (res) => {
        const allowed = (res.bookings || []).filter((b: any) => b.status === 'Booked' || b.status === 'CheckedIn');
        this.bookings = allowed;
      },
      error: (err) => this.toast.error(err.error?.message || 'Failed to load bookings'),
    });
  }

  loadIssues() {
    this.hotel.myIssues().subscribe({
      next: (res) => (this.issues = res.issues || []),
      error: (err) => this.toast.error(err.error?.message || 'Failed to load issues'),
    });
  }

  submitIssue() {
    if (this.issueForm.invalid) {
      this.issueForm.markAllAsTouched();
      return;
    }
    this.hotel.createIssue(this.issueForm.getRawValue() as { booking_id: number; description: string }).subscribe({
      next: () => {
        this.toast.success('Issue submitted');
        this.issueForm.reset({ booking_id: null, description: '' });
        this.loadIssues();
      },
      error: (err) => this.toast.error(err.error?.message || 'Failed to submit issue'),
    });
  }
}

