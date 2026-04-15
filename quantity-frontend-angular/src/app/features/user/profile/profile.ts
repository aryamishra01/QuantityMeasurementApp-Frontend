import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../../core/services/user.service';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../core/models/user.model';
import { NavbarComponent } from '../../../shared/navbar/navbar';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, NavbarComponent],
  templateUrl: './profile.html',
  styleUrls: ['./profile.css']
})
export class ProfileComponent implements OnInit {
  private userService = inject(UserService);
  private authService = inject(AuthService);

  user: User | null = null;
  loading = false;
  errorMessage = '';

  fallback = {
    fullName: '',
    username: '',
    email: '',
    roles: [] as string[]
  };

  ngOnInit(): void {
    this.loadFallbackProfile();
    this.loadUserProfile();
  }

  private loadFallbackProfile(): void {
    const storedUser = this.authService.getStoredUser();

    if (storedUser) {
      this.fallback.fullName = storedUser.fullName;
      this.fallback.username = storedUser.username;
      this.fallback.email = storedUser.email;
      this.fallback.roles = storedUser.roles || [];
    } else {
      this.fallback.fullName = localStorage.getItem('fullName') || '';
      this.fallback.username = localStorage.getItem('username') || '';
      this.fallback.email = localStorage.getItem('userEmail') || '';

      const storedRoles = localStorage.getItem('roles');
      if (storedRoles) {
        try {
          this.fallback.roles = JSON.parse(storedRoles);
        } catch {
          this.fallback.roles = storedRoles
            .split(',')
            .map((role) => role.trim())
            .filter(Boolean);
        }
      }
    }
  }

  private loadUserProfile(): void {
    this.loading = true;
    this.errorMessage = '';
    this.user = null;

    console.log('Loading profile from backend');
    this.userService.getProfile().subscribe({
      next: (profile) => {
        console.log('Profile loaded', profile);
        this.user = profile;
        this.loading = false;
      },
      error: (error) => {
        console.log('Profile error', error);
        this.loading = false;
        this.errorMessage =
          error?.error?.message ||
          error?.message ||
          'Unable to load profile. Showing fallback data when available.';
      }
    });
  }

  get displayName(): string {
    return this.user?.fullName || this.fallback.fullName || 'Unknown User';
  }

  get userName(): string {
    return this.user?.username || this.fallback.username || 'anonymous';
  }

  get userEmail(): string {
    return this.user?.email || this.fallback.email || 'Not provided';
  }

  get userRoles(): string[] {
    return this.user?.roles?.length ? this.user.roles : this.fallback.roles;
  }
}
