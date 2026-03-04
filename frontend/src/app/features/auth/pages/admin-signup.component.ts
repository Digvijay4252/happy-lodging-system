import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  standalone: true,
  selector: 'app-admin-signup',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './admin-signup.component.html',
  styleUrl: './admin-signup.component.scss',
})
export class AdminSignupComponent {
  form = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    setup_key: [''],
  });

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router, private toast: ToastService) {}

  submit() {
    if (this.form.invalid) return;
    this.auth.registerAdmin(this.form.value as any).subscribe({
      next: () => {
        this.toast.success('Admin account created. Please login.');
        this.router.navigate(['/auth/login/admin']);
      },
      error: (err) => this.toast.error(err.error?.message || 'Admin signup failed'),
    });
  }
}
