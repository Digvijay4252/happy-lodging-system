import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  standalone: true,
  selector: 'app-customer-signup',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './customer-signup.component.html',
  styleUrl: './customer-signup.component.scss',
})
export class CustomerSignupComponent {
  form = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router, private toast: ToastService) {}

  submit() {
    if (this.form.invalid) return;
    this.auth.register(this.form.value as any).subscribe({
      next: () => {
        this.toast.success('Customer registration successful');
        this.router.navigate(['/auth/login/customer']);
      },
      error: (err) => this.toast.error(err.error?.message || 'Registration failed'),
    });
  }
}
