import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import {
  StudentRegistrationRequest,
  StudentStatusResponse,
  StudentProfile,
  ActiveSession,
  QRAttendanceRequest,
  StudentAttendanceRecord,
  ChangePasswordRequest
} from '@core/models/student.model';

@Injectable({
  providedIn: 'root'
})
export class StudentService {
  private apiUrl = `${environment.apiUrl}/Student`;

  constructor(private http: HttpClient) {}

  // Registration
  register(request: StudentRegistrationRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, request);
  }

  // Check Status
  checkStatus(nationalId: string): Observable<StudentStatusResponse> {
    return this.http.get<StudentStatusResponse>(`${this.apiUrl}/status/${nationalId}`);
  }

  // Profile
  getProfile(): Observable<StudentProfile> {
    return this.http.get<StudentProfile>(`${this.apiUrl}/profile`);
  }

  changePassword(request: ChangePasswordRequest): Observable<any> {
    return this.http.put(`${this.apiUrl}/profile/change-password`, request);
  }

  // Active Sessions
  getActiveSessions(): Observable<ActiveSession[]> {
    return this.http.get<ActiveSession[]>(`${this.apiUrl}/sessions/active`);
  }

  // Attendance
  submitQRAttendance(request: QRAttendanceRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/attendance/qr`, request);
  }

  getMyAttendanceRecords(): Observable<StudentAttendanceRecord[]> {
    return this.http.get<StudentAttendanceRecord[]>(`${this.apiUrl}/attendance/my-records`);
  }
}
