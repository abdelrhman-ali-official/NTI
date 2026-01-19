import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { StudentService } from '../../services/student.service';
import { StudentStatusResponse } from '@core/models/student.model';

@Component({
  selector: 'app-status-check',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './status-check.component.html',
  styleUrls: ['./status-check.component.css']
})
export class StatusCheckComponent implements OnInit {
  nationalId = '';
  status: StudentStatusResponse | null = null;
  loading = false;
  error: string | null = null;

  constructor(
    private studentService: StudentService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Check if nationalId was passed from registration
    this.route.queryParams.subscribe(params => {
      if (params['nationalId']) {
        this.nationalId = params['nationalId'];
        this.checkStatus();
      }
    });
  }

  checkStatus(): void {
    if (!this.nationalId || this.nationalId.length !== 14) {
      this.error = 'Please enter a valid 14-digit National ID';
      return;
    }

    this.loading = true;
    this.error = null;
    this.status = null;

    this.studentService.checkStatus(this.nationalId).subscribe({
      next: (response) => {
        this.status = response;
        this.loading = false;
      },
      error: (error) => {
        this.error = error.error?.message || 'Failed to check status. Please try again.';
        this.loading = false;
      }
    });
  }

  goToLogin(): void {
    this.router.navigate(['/auth/login']);
  }
}
