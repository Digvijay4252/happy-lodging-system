import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  standalone: true,
  selector: 'app-staff-signup',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './staff-signup.component.html',
  styleUrl: './staff-signup.component.scss',
})
export class StaffSignupComponent {
  form = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router, private toast: ToastService) {}

  submit() {
    if (this.form.invalid) return;
    this.auth.registerStaff({ ...(this.form.value as any), role: 'staff' }).subscribe({
      next: () => {
        this.toast.success('Staff account created');
        this.router.navigate(['/auth/login/staff']);
      },
      error: (err) => this.toast.error(err.error?.message || 'Staff creation failed.'),
    });
  }
}
