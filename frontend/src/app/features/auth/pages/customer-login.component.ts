import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  standalone: true,
  selector: 'app-customer-login',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './customer-login.component.html',
  styleUrl: './customer-login.component.scss',
})
export class CustomerLoginComponent {
  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private toast: ToastService
  ) {}

  submit() {
    if (this.form.invalid) return;
    this.auth.login({ ...(this.form.value as any), role: 'customer' }).subscribe({
      next: (res) => {
        this.auth.saveSession(res.token, res.user);
        this.toast.success('Login successful');
        const redirect = this.route.snapshot.queryParamMap.get('redirect');
        if (redirect && redirect.startsWith('/')) {
          this.router.navigateByUrl(redirect);
          return;
        }
        this.router.navigate(['/customer']);
      },
      error: (err) => this.toast.error(err.error?.message || 'Customer login failed'),
    });
  }
}
