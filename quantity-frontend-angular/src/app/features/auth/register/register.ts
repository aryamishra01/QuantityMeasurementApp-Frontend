import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { RegisterRequest } from '../../../core/models/auth.model';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register.html',
  styleUrls: ['./register.css']
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  loading = false;
  errorMessage = '';
  successMessage = '';

  registerForm = this.fb.group({
    fullName: ['', [Validators.required]],
    username: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  constructor() {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/dashboard']);
    }
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const payload = this.registerForm.getRawValue() as RegisterRequest;

    console.log('Sending register request with payload:', payload);

    this.authService.register(payload).subscribe({
      next: (response) => {
        console.log('Register success response:', response);
        this.loading = false;
        this.successMessage = 'Registration successful! Redirecting to login...';
        setTimeout(() => this.router.navigate(['/login']), 1200);
      },
      error: (error) => {
        console.error('Register error:', error);
        this.loading = false;
        const errorMsg = error?.error?.message ||
          error?.error?.error ||
          error?.message ||
          error?.statusText ||
          'Registration failed. Please try again.';
        this.errorMessage = errorMsg;
      }
    });
  }

  navigateToLogin(): void {
    this.router.navigate(['/login']);
  }
}