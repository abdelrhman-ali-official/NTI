import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { InstructorService } from '../../services/instructor.service';
import { AuthService } from '@core/services/auth.service';
import { Session, Student, Track, CreateHistoricalSessionRequest, SessionAttendance } from '@core/models/instructor.model';
import { formatEgyptDateTime, convertToEgyptTime, convertEgyptTimeToUTC } from '../../../../shared/utils/date-converter.util';
import { EgyptDatePipe } from '../../../../shared/pipes/egypt-date.pipe';

@Component({
  selector: 'app-instructor-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, EgyptDatePipe],
  templateUrl: './instructor-dashboard.component.html',
  styleUrls: ['./instructor-dashboard.component.css']
})
export class InstructorDashboardComponent implements OnInit {
  // Tab management
  activeTab: 'sessions' | 'students' | 'historical' = 'sessions';
  
  // Sessions
  sessions: Session[] = [];
  loading = false;
  error: string | null = null;

  // Students
  allStudents: Student[] = [];
  pendingStudents: Student[] = [];
  displayedStudents: Student[] = [];
  loadingStudents = false;
  searchQuery = '';
  approvingStudent: string | null = null;
  selectedTrackIds: Map<string, number> = new Map();

  // Tracks
  tracks: Track[] = [];

  // Historical Sessions
  historicalSession: CreateHistoricalSessionRequest = {
    trackId: 0,
    sessionDate: '',
    sessionTitle: '',
    attendedStudentLastFourDigits: []
  };
  currentDigits = '';
  creatingHistorical = false;

  // Profile
  profileMenuOpen = false;
  showPasswordModal = false;
  newPassword = '';
  confirmPassword = '';
  passwordError = '';
  passwordSuccess = '';
  changingPassword = false;
  firstName = '';
  mobileMenuOpen = false;

  // Attendance Modal
  showAttendanceModal = false;
  selectedSessionAttendance: SessionAttendance[] = [];
  selectedSessionName = '';
  loadingAttendance = false;

  // Delete Session
  deletingSessionId: number | null = null;
  showDeleteModal = false;
  sessionToDelete: Session | null = null;

  constructor(
    private instructorService: InstructorService,
    private authService: AuthService
  ) {
    const user = this.authService.getCurrentUser();
    if (user?.displayName) {
      this.firstName = user.displayName.split(' ')[0];
    }
  }

  ngOnInit(): void {
    this.loadSessions();
    this.loadTracks();
    this.loadStudents();
    this.loadPendingStudents();
  }

  // Sessions
  loadSessions(): void {
    this.loading = true;
    this.error = null;
    
    this.instructorService.getMySessions().subscribe({
      next: (sessions) => {
        this.sessions = sessions.sort((a, b) => 
          new Date(b.sessionDate).getTime() - new Date(a.sessionDate).getTime()
        );
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load sessions';
        this.loading = false;
        console.error(error);
      }
    });
  }

  getSessionStatus(session: Session): string {
    if (session.isCheckInOpen) {
      return 'Check-In Open';
    }
    if (session.isCheckOutOpen) {
      return 'Check-Out Open';
    }
    if (session.checkOutClosedAt) {
      return 'Completed';
    }
    if (session.checkInClosedAt) {
      return 'Check-In Closed';
    }
    return 'Scheduled';
  }

  getStatusClass(session: Session): string {
    const status = this.getSessionStatus(session);
    switch (status) {
      case 'Check-In Open':
      case 'Check-Out Open':
        return 'status-active';
      case 'Completed':
        return 'status-completed';
      case 'Check-In Closed':
        return 'status-pending';
      default:
        return 'status-scheduled';
    }
  }

  // Students
  loadStudents(): void {
    this.loadingStudents = true;
    this.instructorService.getAllStudents().subscribe({
      next: (students) => {
        this.allStudents = students.filter(s => s.status === 'Approved');
        this.displayedStudents = [...this.allStudents];
        this.loadingStudents = false;
      },
      error: (error) => {
        console.error('Failed to load students', error);
        this.loadingStudents = false;
      }
    });
  }

  loadPendingStudents(): void {
    this.instructorService.getPendingStudents().subscribe({
      next: (students) => {
        this.pendingStudents = students;
      },
      error: (error) => {
        console.error('Failed to load pending students', error);
      }
    });
  }

  searchStudents(): void {
    if (!this.searchQuery.trim()) {
      this.displayedStudents = [...this.allStudents];
      return;
    }

    const query = this.searchQuery.toLowerCase();
    this.displayedStudents = this.allStudents.filter(student =>
      student.fullNameEnglish.toLowerCase().includes(query) ||
      student.fullNameArabic.includes(query) ||
      student.nationalId.includes(query) ||
      student.email.toLowerCase().includes(query)
    );
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.displayedStudents = [...this.allStudents];
  }

  approveStudent(studentId: string, approve: boolean): void {
    const trackId = this.selectedTrackIds.get(studentId) || 0;
    this.approvingStudent = studentId;
    this.instructorService.approveStudent({ studentId, approve, trackId }).subscribe({
      next: () => {
        this.pendingStudents = this.pendingStudents.filter(s => s.id !== studentId);
        this.selectedTrackIds.delete(studentId);
        this.approvingStudent = null;
        if (approve) {
          this.loadStudents();
        }
      },
      error: (error) => {
        console.error('Failed to approve student', error);
        this.approvingStudent = null;
      }
    });
  }

  getSelectedTrackId(studentId: string): number | null {
    return this.selectedTrackIds.get(studentId) || null;
  }

  setSelectedTrackId(studentId: string, trackId: number): void {
    this.selectedTrackIds.set(studentId, trackId);
  }

  // Tracks
  loadTracks(): void {
    this.instructorService.getTracks().subscribe({
      next: (tracks) => {
        console.log('Tracks received from API:', tracks);
        // Map the API response to ensure both id/trackId and name/trackName are available
        this.tracks = tracks.map(track => ({
          ...track,
          trackId: track.trackId || track.id,
          trackName: track.trackName || track.name
        }));
        console.log('Mapped tracks:', this.tracks);
      },
      error: (error) => {
        console.error('Failed to load tracks', error);
      }
    });
  }

  // Historical Sessions
  addStudentDigits(): void {
    if (this.currentDigits && this.currentDigits.length === 4 && /^\d{4}$/.test(this.currentDigits)) {
      if (!this.historicalSession.attendedStudentLastFourDigits.includes(this.currentDigits)) {
        this.historicalSession.attendedStudentLastFourDigits.push(this.currentDigits);
      }
      this.currentDigits = '';
    }
  }

  removeStudentDigits(digits: string): void {
    this.historicalSession.attendedStudentLastFourDigits = 
      this.historicalSession.attendedStudentLastFourDigits.filter(d => d !== digits);
  }

  createHistoricalSession(): void {
    this.creatingHistorical = true;
    
    // Convert the session date from Egypt time to UTC before sending to backend
    const requestData = {
      ...this.historicalSession,
      sessionDate: convertEgyptTimeToUTC(this.historicalSession.sessionDate)
    };
    
    this.instructorService.createHistoricalSession(requestData).subscribe({
      next: () => {
        this.creatingHistorical = false;
        this.historicalSession = {
          trackId: 0,
          sessionDate: '',
          sessionTitle: '',
          attendedStudentLastFourDigits: []
        };
        this.currentDigits = '';
        this.loadSessions();
        this.activeTab = 'sessions';
      },
      error: (error) => {
        console.error('Failed to create historical session', error);
        this.creatingHistorical = false;
      }
    });
  }

  // Profile
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
    this.instructorService.changePassword({ newPassword: this.newPassword }).subscribe({
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

  logout(): void {
    this.authService.logout();
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  goToLogo(): void {
    this.activeTab = 'sessions';
    this.mobileMenuOpen = false;
  }

  // Attendance Management
  viewAttendance(session: Session): void {
    this.selectedSessionName = session.sessionName;
    this.loadingAttendance = true;
    this.showAttendanceModal = true;
    this.selectedSessionAttendance = [];

    this.instructorService.getSessionAttendance(session.id).subscribe({
      next: (attendance) => {
        this.selectedSessionAttendance = attendance;
        this.loadingAttendance = false;
      },
      error: (error) => {
        console.error('Failed to load attendance', error);
        this.loadingAttendance = false;
        this.error = 'Failed to load attendance data';
      }
    });
  }

  closeAttendanceModal(): void {
    this.showAttendanceModal = false;
    this.selectedSessionAttendance = [];
    this.selectedSessionName = '';
  }

  formatDateTime(dateTime: string | null): string {
    if (!dateTime) return '-';
    return formatEgyptDateTime(dateTime, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  get totalCheckIns(): number {
    return this.selectedSessionAttendance.filter(a => a.checkIn).length;
  }

  get totalCheckOuts(): number {
    return this.selectedSessionAttendance.filter(a => a.isCheckedOut).length;
  }

  deleteSession(sessionId: number): void {
    const session = this.sessions.find(s => s.id === sessionId);
    if (session) {
      this.sessionToDelete = session;
      this.showDeleteModal = true;
    }
  }

  confirmDelete(): void {
    if (!this.sessionToDelete) return;

    this.deletingSessionId = this.sessionToDelete.id;
    this.instructorService.deleteSession(this.sessionToDelete.id).subscribe({
      next: () => {
        this.deletingSessionId = null;
        this.sessions = this.sessions.filter(s => s.id !== this.sessionToDelete!.id);
        this.closeDeleteModal();
      },
      error: (error) => {
        this.deletingSessionId = null;
        this.error = 'Failed to delete session';
        console.error(error);
        this.closeDeleteModal();
      }
    });
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.sessionToDelete = null;
  }
}
