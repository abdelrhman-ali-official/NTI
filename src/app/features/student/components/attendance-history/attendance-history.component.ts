import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { StudentService } from '../../services/student.service';
import { StudentAttendanceRecord } from '../../../../core/models/student.model';
import { AuthService } from '../../../../core/services/auth.service';
import { formatEgyptDate, formatEgyptTime } from '../../../../shared/utils/date-converter.util';

@Component({
  selector: 'app-attendance-history',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './attendance-history.component.html',
  styleUrl: './attendance-history.component.css'
})
export class AttendanceHistoryComponent implements OnInit {
  attendanceRecords: StudentAttendanceRecord[] = [];
  filteredRecords: StudentAttendanceRecord[] = [];
  loading = true;
  error = '';

  // Filters
  selectedFilter: 'all' | 'completed' | 'incomplete' = 'all';
  searchQuery = '';
  
  firstName = '';

  constructor(
    private studentService: StudentService,
    private authService: AuthService,
    private router: Router
  ) {
    const user = this.authService.getCurrentUser();
    if (user?.displayName) {
      this.firstName = user.displayName.split(' ')[0];
    }
  }

  ngOnInit(): void {
    this.loadAttendanceHistory();
  }

  goBack(): void {
    this.router.navigate(['/student/dashboard']);
  }

  goToLogo(): void {
    const userType = this.authService.getUserType();
    if (userType === 'Student') {
      this.router.navigate(['/student/dashboard']);
    } else if (userType === 'Instructor' || userType === 'Admin') {
      this.router.navigate(['/instructor/dashboard']);
    }
  }

  logout(): void {
    this.authService.logout();
  }

  loadAttendanceHistory(): void {
    this.loading = true;
    this.error = '';

    this.studentService.getMyAttendanceRecords().subscribe({
      next: (records) => {
        console.log('Attendance records loaded:', records);
        this.attendanceRecords = records;
        this.applyFilters();
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load attendance records:', err);
        this.error = err.error?.message || err.message || 'Failed to load attendance history';
        this.loading = false;
      }
    });
  }

  onFilterChange(filter: 'all' | 'completed' | 'incomplete'): void {
    this.selectedFilter = filter;
    this.applyFilters();
  }

  onSearchChange(event: Event): void {
    this.searchQuery = (event.target as HTMLInputElement).value;
    this.applyFilters();
  }

  applyFilters(): void {
    let filtered = [...this.attendanceRecords];

    // Apply status filter
    if (this.selectedFilter === 'completed') {
      filtered = filtered.filter(record => 
        record.checkIn?.at !== null && record.checkOut?.at !== null
      );
    } else if (this.selectedFilter === 'incomplete') {
      filtered = filtered.filter(record => 
        !record.checkIn?.at || !record.checkOut?.at
      );
    }

    // Apply search filter
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(record =>
        record.sessionName.toLowerCase().includes(query)
      );
    }

    this.filteredRecords = filtered;
  }

  formatDate(dateString: string): string {
    return formatEgyptDate(dateString);
  }

  formatTime(dateTimeString: string | null): string {
    if (!dateTimeString) return '-';
    return formatEgyptTime(dateTimeString);
  }

  getStatusColor(record: StudentAttendanceRecord): string {
    if (record.checkIn?.at && record.checkOut?.at) {
      return 'complete';
    } else if (record.checkIn?.at) {
      return 'partial';
    } else {
      return 'absent';
    }
  }

  getStatusText(record: StudentAttendanceRecord): string {
    if (record.checkIn?.at && record.checkOut?.at) {
      return 'Complete';
    } else if (record.checkIn?.at) {
      return 'Check-In Only';
    } else {
      return 'Absent';
    }
  }

  get completedCount(): number {
    return this.attendanceRecords.filter(r => r.checkIn?.at && r.checkOut?.at).length;
  }

  get partialCount(): number {
    return this.attendanceRecords.filter(r => r.checkIn?.at && !r.checkOut?.at).length;
  }

  get absentCount(): number {
    return this.attendanceRecords.filter(r => !r.checkIn?.at).length;
  }

  get attendanceRate(): number {
    if (this.attendanceRecords.length === 0) return 0;
    return Math.round((this.completedCount / this.attendanceRecords.length) * 100);
  }
}
