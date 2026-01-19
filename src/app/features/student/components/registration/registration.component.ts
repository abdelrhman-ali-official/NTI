import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { StudentService } from '../../services/student.service';
import { InstructorService } from '@features/instructor/services/instructor.service';
import { Track } from '@core/models/instructor.model';

@Component({
  selector: 'app-student-registration',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.css']
})
export class RegistrationComponent implements OnInit {
  registrationForm!: FormGroup;
  tracks: Track[] = [];
  loading = false;
  error: string | null = null;
  success = false;

  constructor(
    private fb: FormBuilder,
    private studentService: StudentService,
    private instructorService: InstructorService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadTracks();
  }

  initForm(): void {
    this.registrationForm = this.fb.group({
      nationalId: ['', [Validators.required, Validators.pattern(/^\d{14}$/)]],
      fullNameArabic: ['', Validators.required],
      fullNameEnglish: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required],
      trackId: [0, [Validators.required, Validators.min(1)]]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    return password && confirmPassword && password.value === confirmPassword.value
      ? null
      : { passwordMismatch: true };
  }

  loadTracks(): void {
    this.instructorService.getTracks().subscribe({
      next: (tracks) => {
        this.tracks = tracks.filter(t => t.isActive);
      },
      error: (error) => {
        console.error('Failed to load tracks', error);
      }
    });
  }

  onSubmit(): void {
    if (this.registrationForm.invalid) {
      this.registrationForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.error = null;

    const { confirmPassword, ...formData } = this.registrationForm.value;

    this.studentService.register(formData).subscribe({
      next: () => {
        this.success = true;
        this.loading = false;
        setTimeout(() => {
          this.router.navigate(['/student/status'], {
            queryParams: { nationalId: formData.nationalId }
          });
        }, 2000);
      },
      error: (error) => {
        this.error = error.error?.message || 'Registration failed. Please try again.';
        this.loading = false;
      }
    });
  }

  get f() {
    return this.registrationForm.controls;
  }
}
