import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-session-redirect',
  standalone: true,
  template: '',
})
export class SessionRedirectComponent implements OnInit {
  constructor(private auth: AuthService, private router: Router, private route: ActivatedRoute) {}

  ngOnInit(): void {
    const redirect = this.route.snapshot.queryParamMap.get('redirect');

    if (this.auth.isLoggedIn()) {
      if (redirect && redirect.startsWith('/')) {
        this.router.navigateByUrl(redirect);
        return;
      }

      const role = this.auth.getRole();
      if (role === 'admin') {
        this.router.navigate(['/admin']);
        return;
      }
      if (role === 'staff') {
        this.router.navigate(['/staff']);
        return;
      }
      this.router.navigate(['/customer']);
      return;
    }

    this.router.navigate(['/auth/login/customer']);
  }
}
