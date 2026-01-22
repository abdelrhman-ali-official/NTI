import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { StudentService } from '../../services/student.service';
import { AuthService } from '@core/services/auth.service';
import { ActiveSession, StudentProfile } from '@core/models/student.model';
import { FormsModule } from '@angular/forms';
import { formatEgyptDate, formatEgyptTime } from '../../../../shared/utils/date-converter.util';

// QR Scanner interface
declare var Html5QrcodeScanner: any;

@Component({
  selector: 'app-student-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class StudentDashboardComponent implements OnInit {
  // Tab management
  activeTab: 'sessions' | 'profile' | 'history' = 'sessions';

  // Active Sessions
  activeSessions: ActiveSession[] = [];
  loading = false;
  error: string | null = null;

  // Profile
  profile: StudentProfile | null = null;
  loadingProfile = false;

  // Profile menu
  profileMenuOpen = false;
  showPasswordModal = false;
  newPassword = '';
  confirmPassword = '';
  passwordError = '';
  passwordSuccess = '';
  changingPassword = false;
  
  // Mobile menu
  mobileMenuOpen = false;
  
  // User greeting
  firstName = '';

  // QR Scanner
  showQRScanner = false;
  scanningSession: ActiveSession | null = null;
  qrScanner: any = null;
  scanSuccess = false;
  scanError: string | null = null;

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
    this.loadActiveSessions();
    this.loadProfile();
  }

  loadActiveSessions(): void {
    this.loading = true;
    this.error = null;

    this.studentService.getActiveSessions().subscribe({
      next: (sessions) => {
        this.activeSessions = sessions;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load active sessions';
        this.loading = false;
        console.error(error);
      }
    });
  }

  loadProfile(): void {
    this.loadingProfile = true;
    this.studentService.getProfile().subscribe({
      next: (profile) => {
        this.profile = profile;
        this.loadingProfile = false;
      },
      error: (error) => {
        console.error('Failed to load profile', error);
        this.loadingProfile = false;
      }
    });
  }

  getSessionStatus(session: ActiveSession): string {
    if (session.isCheckInOpen) {
      return 'Check-In Open';
    }
    if (session.isCheckOutOpen) {
      return 'Check-Out Open';
    }
    return 'Closed';
  }

  getStatusClass(session: ActiveSession): string {
    if (session.isCheckInOpen) {
      return 'status-check-in';
    }
    if (session.isCheckOutOpen) {
      return 'status-check-out';
    }
    return 'status-closed';
  }

  openQRScanner(session: ActiveSession): void {
    this.scanningSession = session;
    this.showQRScanner = true;
    this.scanSuccess = false;
    this.scanError = null;

    // Initialize QR scanner after view updates
    setTimeout(() => {
      this.initQRScanner();
    }, 100);
  }

  initQRScanner(): void {
    // Check if Html5QrcodeScanner is available
    if (typeof Html5QrcodeScanner === 'undefined') {
      this.scanError = 'QR Scanner library not loaded. Please refresh the page.';
      return;
    }

    this.qrScanner = new Html5QrcodeScanner(
      "qr-reader",
      { fps: 10, qrbox: 250 },
      false
    );

    this.qrScanner.render(
      (decodedText: string) => {
        this.onScanSuccess(decodedText);
      },
      (error: any) => {
        // Ignore scan errors
      }
    );
  }

  onScanSuccess(qrToken: string): void {
    if (this.qrScanner) {
      this.qrScanner.clear();
    }

    this.studentService.submitQRAttendance({ qrToken }).subscribe({
      next: () => {
        this.scanSuccess = true;
        setTimeout(() => {
          this.closeQRScanner();
          this.loadActiveSessions();
        }, 2000);
      },
      error: (error) => {
        this.scanError = error.error?.message || 'Failed to submit attendance';
      }
    });
  }

  closeQRScanner(): void {
    if (this.qrScanner) {
      this.qrScanner.clear();
      this.qrScanner = null;
    }
    this.showQRScanner = false;
    this.scanningSession = null;
    this.scanSuccess = false;
    this.scanError = null;
  }

  retryQRScan(): void {
    this.scanError = null;
    this.scanSuccess = false;
    this.initQRScanner();
  }

  toggleProfileMenu(event: Event): void {
    event.stopPropagation();
    this.profileMenuOpen = !this.profileMenuOpen;

    if (this.profileMenuOpen) {
      setTimeout(() => {
        document.addEventListener('click', this.closeProfileMenu);
      });
    }
  }

  closeProfileMenu = (): void => {
    this.profileMenuOpen = false;
    document.removeEventListener('click', this.closeProfileMenu);
  }

  openChangePassword(): void {
    this.showPasswordModal = true;
    this.profileMenuOpen = false;
    this.newPassword = '';
    this.confirmPassword = '';
    this.passwordError = '';
    this.passwordSuccess = '';
  }

  closePasswordModal(): void {
    this.showPasswordModal = false;
    this.newPassword = '';
    this.confirmPassword = '';
    this.passwordError = '';
    this.passwordSuccess = '';
  }

  changePassword(): void {
    this.passwordError = '';
    this.passwordSuccess = '';

    if (this.newPassword.length < 8) {
      this.passwordError = 'Password must be at least 8 characters';
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.passwordError = 'Passwords do not match';
      return;
    }

    this.changingPassword = true;
    this.studentService.changePassword({ newPassword: this.newPassword }).subscribe({
      next: () => {
        this.changingPassword = false;
        this.passwordSuccess = 'Password changed successfully!';
        setTimeout(() => {
          this.closePasswordModal();
        }, 2000);
      },
      error: (error) => {
        this.changingPassword = false;
        this.passwordError = error.error?.message || 'Failed to change password';
      }
    });
  }

  navigateToHistory(): void {
    this.router.navigate(['/student/attendance-history']);
  }
  
  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
    if (this.mobileMenuOpen) {
      this.profileMenuOpen = false;
    }
  }
  
  goToLogo(): void {
    const userType = this.authService.getUserType();
    if (userType === 'Student') {
      this.router.navigate(['/student/dashboard']);
      this.activeTab = 'sessions';
    } else if (userType === 'Instructor' || userType === 'Admin') {
      this.router.navigate(['/instructor/dashboard']);
    }
  }

  logout(): void {
    this.authService.logout();
  }

  formatDate(date: string): string {
    return formatEgyptDate(date);
  }

  formatTime(date: string): string {
    return formatEgyptTime(date, {
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
