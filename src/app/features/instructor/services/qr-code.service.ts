import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Subject, interval, takeUntil, switchMap } from 'rxjs';
import { InstructorService } from './instructor.service';
import { QRResponse } from '@core/models/instructor.model';

@Injectable()
export class QRCodeService implements OnDestroy {
  private destroy$ = new Subject<void>();
  private qrToken$ = new BehaviorSubject<string>('');
  private qrExpiry$ = new BehaviorSubject<Date | null>(null);
  private isGenerating$ = new BehaviorSubject<boolean>(false);
  
  public currentQRToken$ = this.qrToken$.asObservable();
  public qrExpiry = this.qrExpiry$.asObservable();
  public isGenerating = this.isGenerating$.asObservable();

  private sessionId: number | null = null;
  private qrType: 'CheckIn' | 'CheckOut' = 'CheckIn';

  constructor(private instructorService: InstructorService) {}

  startQRGeneration(sessionId: number, type: 'CheckIn' | 'CheckOut' = 'CheckIn'): void {
    this.sessionId = sessionId;
    this.qrType = type;
    this.isGenerating$.next(true);
    
    // Generate immediately
    this.generateQR();
    
    // Then every 60 seconds
    interval(60000)
      .pipe(
        takeUntil(this.destroy$),
        switchMap(() => this.getQRObservable(sessionId, type))
      )
      .subscribe({
        next: (response: QRResponse) => {
          this.qrToken$.next(response.token);
          this.qrExpiry$.next(new Date(response.expiresAt));
        },
        error: (error) => {
          console.error('QR generation failed:', error);
          // Retry after 5 seconds on error
          setTimeout(() => this.generateQR(), 5000);
        }
      });
  }

  stopQRGeneration(): void {
    this.isGenerating$.next(false);
    this.qrToken$.next('');
    this.qrExpiry$.next(null);
    this.destroy$.next();
  }

  private getQRObservable(sessionId: number, type: 'CheckIn' | 'CheckOut') {
    return type === 'CheckIn'
      ? this.instructorService.generateCheckInQR(sessionId)
      : this.instructorService.generateCheckOutQR(sessionId);
  }

  private generateQR(): void {
    if (this.sessionId) {
      this.getQRObservable(this.sessionId, this.qrType).subscribe({
        next: (response: QRResponse) => {
          this.qrToken$.next(response.token);
          this.qrExpiry$.next(new Date(response.expiresAt));
        },
        error: (error) => {
          console.error('QR generation failed:', error);
        }
      });
    }
  }

  ngOnDestroy(): void {
    this.stopQRGeneration();
  }
}
