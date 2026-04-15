import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css']
})
export class NavbarComponent {
  private router = inject(Router);
  private authService = inject(AuthService);

  get userGreeting(): string {
    const user = this.authService.getStoredUser();
    if (user?.fullName) {
      return `Welcome, ${user.fullName}`;
    }
    if (user?.username) {
      return `Welcome, ${user.username}`;
    }
    return 'Welcome';
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
