import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { InstructorService } from '../../services/instructor.service';
import { Track } from '@core/models/instructor.model';

@Component({
  selector: 'app-create-session',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './create-session.component.html',
  styleUrls: ['./create-session.component.css']
})
export class CreateSessionComponent implements OnInit {
  sessionForm!: FormGroup;
  tracks: Track[] = [];
  loading = false;
  error: string | null = null;

  constructor(
    private fb: FormBuilder,
    private instructorService: InstructorService,
    private router: Router
  ) {
    this.initForm();
  }

  ngOnInit(): void {
    this.loadTracks();
  }

  initForm(): void {
    const today = new Date();
    const defaultDate = today.toISOString().slice(0, 16);

    this.sessionForm = this.fb.group({
      sessionName: ['', [Validators.required, Validators.minLength(3)]],
      trackId: [null, Validators.required],
      sessionDate: [defaultDate, Validators.required]
    });
  }

  loadTracks(): void {
    this.instructorService.getTracks().subscribe({
      next: (tracks) => {
        // Map API response to include both id/name and trackId/trackName for compatibility
        this.tracks = tracks.map(track => ({
          ...track,
          trackId: track.id,
          trackName: track.name
        }));
      },
      error: (error) => {
        console.error('Failed to load tracks:', error);
        this.error = 'Failed to load tracks. Please try again.';
      }
    });
  }

  onSubmit(): void {
    if (this.sessionForm.invalid) {
      this.markFormGroupTouched(this.sessionForm);
      return;
    }

    this.loading = true;
    this.error = null;

    const formValue = this.sessionForm.value;
    const request = {
      ...formValue,
      sessionDate: new Date(formValue.sessionDate).toISOString()
    };

    this.instructorService.createSession(request).subscribe({
      next: (session) => {
        this.router.navigate(['/instructor/sessions', session.id]);
      },
      error: (error) => {
        this.error = error.error?.message || 'Failed to create session';
        this.loading = false;
      }
    });
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.sessionForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.sessionForm.get(fieldName);
    if (field?.hasError('required')) {
      return 'This field is required';
    }
    if (field?.hasError('minlength')) {
      return 'Minimum length is 3 characters';
    }
    return '';
  }
}
