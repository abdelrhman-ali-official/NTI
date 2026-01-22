import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { QRCodeModule } from 'angularx-qrcode';
import { InstructorService } from '../../services/instructor.service';
import { QRCodeService } from '../../services/qr-code.service';
import { Session, AttendanceRecord, ManualAttendanceRequest } from '@core/models/instructor.model';
import { interval, Subscription } from 'rxjs';
import { EgyptDatePipe } from '../../../../shared/pipes/egypt-date.pipe';

@Component({
  selector: 'app-session-management',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, QRCodeModule, EgyptDatePipe],
  providers: [QRCodeService],
  templateUrl: './session-management.component.html',
  styleUrls: ['./session-management.component.css']
})
export class SessionManagementComponent implements OnInit, OnDestroy {
  sessionId!: number;
  session: Session | null = null;
  attendance: AttendanceRecord[] = [];
  
  qrToken = '';
  qrSize = 300;
  timeRemaining = 60;
  
  isCheckInOpen = false;
  isCheckOutOpen = false;
  
  // Manual attendance
  lastFourDigits = '';
  attendanceType: 'CheckIn' | 'CheckOut' = 'CheckIn';
  
  loading = false;
  error: string | null = null;
  successMessage: string | null = null;
  
  private timerSubscription?: Subscription;
  private attendanceRefreshSubscription?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private instructorService: InstructorService,
    private qrCodeService: QRCodeService
  ) {}

  ngOnInit(): void {
    this.sessionId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadSession();
    this.loadAttendance();
    this.setupQRSubscription();
    this.startAttendanceRefresh();
  }

  ngOnDestroy(): void {
    this.qrCodeService.stopQRGeneration();
    this.timerSubscription?.unsubscribe();
    this.attendanceRefreshSubscription?.unsubscribe();
  }

  loadSession(): void {
    this.instructorService.getSessionDetails(this.sessionId).subscribe({
      next: (session) => {
        this.session = session;
        this.isCheckInOpen = !!session.checkInOpenedAt && !session.checkInClosedAt;
        this.isCheckOutOpen = !!session.checkOutOpenedAt && !session.checkOutClosedAt;
        
        // Auto-start QR generation if check-in or check-out is open
        if (this.isCheckInOpen) {
          this.qrCodeService.startQRGeneration(this.sessionId, 'CheckIn');
        } else if (this.isCheckOutOpen) {
          this.qrCodeService.startQRGeneration(this.sessionId, 'CheckOut');
        }
      },
      error: (error) => {
        this.error = 'Failed to load session details';
        console.error(error);
      }
    });
  }

  loadAttendance(): void {
    this.instructorService.getSessionAttendance(this.sessionId).subscribe({
      next: (attendance) => {
        this.attendance = attendance;
      },
      error: (error) => {
        console.error('Failed to load attendance:', error);
      }
    });
  }

  setupQRSubscription(): void {
    this.qrCodeService.currentQRToken$.subscribe(token => {
      this.qrToken = token;
      if (token) {
        this.startCountdown();
      }
    });
  }

  startCountdown(): void {
    this.timeRemaining = 60;
    this.timerSubscription?.unsubscribe();
    
    this.timerSubscription = interval(1000).subscribe(() => {
      this.timeRemaining--;
      if (this.timeRemaining <= 0) {
        this.timeRemaining = 60;
      }
    });
  }

  startAttendanceRefresh(): void {
    // Refresh attendance every 30 seconds
    this.attendanceRefreshSubscription = interval(30000).subscribe(() => {
      this.loadAttendance();
    });
  }

  openCheckIn(): void {
    this.loading = true;
    this.error = null;
    
    this.instructorService.openCheckIn(this.sessionId).subscribe({
      next: () => {
        this.isCheckInOpen = true;
        this.successMessage = 'Check-in opened successfully';
        this.qrCodeService.startQRGeneration(this.sessionId, 'CheckIn');
        this.loadSession();
        this.clearMessageAfterDelay();
        this.loading = false;
      },
      error: (error) => {
        this.error = error.error?.message || 'Failed to open check-in';
        this.loading = false;
      }
    });
  }

  closeCheckIn(): void {
    this.loading = true;
    this.error = null;
    
    this.instructorService.closeCheckIn(this.sessionId).subscribe({
      next: () => {
        this.isCheckInOpen = false;
        this.successMessage = 'Check-in closed successfully';
        this.qrCodeService.stopQRGeneration();
        this.loadSession();
        this.loadAttendance();
        this.clearMessageAfterDelay();
        this.loading = false;
      },
      error: (error) => {
        this.error = error.error?.message || 'Failed to close check-in';
        this.loading = false;
      }
    });
  }

  openCheckOut(): void {
    this.loading = true;
    this.error = null;
    
    this.instructorService.openCheckOut(this.sessionId).subscribe({
      next: () => {
        this.isCheckOutOpen = true;
        this.successMessage = 'Check-out opened successfully';
        this.qrCodeService.startQRGeneration(this.sessionId, 'CheckOut');
        this.loadSession();
        this.clearMessageAfterDelay();
        this.loading = false;
      },
      error: (error) => {
        this.error = error.error?.message || 'Failed to open check-out';
        this.loading = false;
      }
    });
  }

  closeCheckOut(): void {
    this.loading = true;
    this.error = null;
    
    this.instructorService.closeCheckOut(this.sessionId).subscribe({
      next: () => {
        this.isCheckOutOpen = false;
        this.successMessage = 'Check-out closed successfully';
        this.qrCodeService.stopQRGeneration();
        this.loadSession();
        this.loadAttendance();
        this.clearMessageAfterDelay();
        this.loading = false;
      },
      error: (error) => {
        this.error = error.error?.message || 'Failed to close check-out';
        this.loading = false;
      }
    });
  }

  markManualAttendance(): void {
    if (!this.lastFourDigits || this.lastFourDigits.length !== 4) {
      this.error = 'Please enter the last 4 digits of National ID';
      return;
    }

    const request: ManualAttendanceRequest = {
      sessionId: this.sessionId,
      lastFourDigits: this.lastFourDigits,
      attendanceType: this.attendanceType
    };

    this.loading = true;
    this.error = null;

    this.instructorService.markManualAttendance(this.sessionId, request).subscribe({
      next: () => {
        this.successMessage = `Manual ${this.attendanceType} recorded successfully`;
        this.lastFourDigits = '';
        this.loadAttendance();
        this.clearMessageAfterDelay();
        this.loading = false;
      },
      error: (error) => {
        this.error = error.error?.message || 'Failed to record manual attendance';
        this.loading = false;
      }
    });
  }

  getAttendanceStats() {
    const total = this.attendance.length;
    const present = this.attendance.filter(a => a.isCheckedOut).length;
    const checkedIn = this.attendance.filter(a => a.checkIn && !a.checkOut).length;
    const absent = total - present - checkedIn;
    
    return { total, present, checkedIn, absent };
  }

  getStatusText(record: AttendanceRecord): string {
    if (record.checkOut) {
      return 'Present';
    } else if (record.checkIn) {
      return 'Checked In';
    }
    return 'Absent';
  }

  getStatusClass(record: AttendanceRecord): string {
    if (record.checkOut) {
      return 'status-present';
    } else if (record.checkIn) {
      return 'status-checkedin';
    }
    return 'status-absent';
  }

  private clearMessageAfterDelay(): void {
    setTimeout(() => {
      this.successMessage = null;
      this.error = null;
    }, 5000);
  }
}
