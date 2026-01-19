import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm: FormGroup;
  loading = false;
  error: string | null = null;
  returnUrl: string = '/';

  selectedUserType: 'Student' | 'Instructor' | 'Admin' = 'Student';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.loginForm = this.fb.group({
      userName: ['', Validators.required],
      password: ['', Validators.required]
    });

    // Get return URL from route parameters or default to '/'
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }

  selectUserType(type: 'Student' | 'Instructor' | 'Admin'): void {
    this.selectedUserType = type;
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;
    this.error = null;

    this.authService.login(this.loginForm.value).subscribe({
      next: (response) => {
        // Validate response structure
        if (!response || !response.userType) {
          console.error('Invalid response structure:', response);
          this.error = 'Invalid response from server';
          this.loading = false;
          return;
        }

        // Navigate based on user type
        if (response.userType === 'Admin') {
          this.router.navigate(['/admin/dashboard']);
        } else if (response.userType === 'Instructor') {
          this.router.navigate(['/instructor/dashboard']);
        } else if (response.userType === 'Student') {
          this.router.navigate(['/student/dashboard']);
        } else {
          this.router.navigate([this.returnUrl]);
        }
      },
      error: (error) => {
        console.error('Login error:', error);
        
        // Handle different error types
        if (error.status === 0) {
          this.error = 'Cannot connect to server. Please check your internet connection or try again later.';
        } else if (error.status === 401) {
          this.error = 'Invalid username or password';
        } else if (error.status === 403) {
          this.error = 'Your account is pending approval';
        } else if (error.status === 500) {
          this.error = 'Server error. Please try again later.';
        } else {
          this.error = error.error?.message || 'An error occurred. Please try again.';
        }
        this.loading = false;
      }
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }
}
