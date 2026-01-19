import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import {
  Session,
  CreateSessionRequest,
  CreateHistoricalSessionRequest,
  QRResponse,
  AttendanceRecord,
  Student,
  ApproveStudentRequest,
  ManualAttendanceRequest,
  Track,
  AttendanceSummary,
  StudentSearchParams,
  ChangePasswordRequest,
  SessionAttendance
} from '@core/models/instructor.model';

@Injectable({
  providedIn: 'root'
})
export class InstructorService {
  private apiUrl = `${environment.apiUrl}/Instructor`;

  constructor(private http: HttpClient) {}

  // Session Management
  createSession(request: CreateSessionRequest): Observable<Session> {
    return this.http.post<Session>(`${this.apiUrl}/sessions`, request);
  }

  createHistoricalSession(request: CreateHistoricalSessionRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/sessions/historical`, request);
  }

  getMySessions(): Observable<Session[]> {
    return this.http.get<Session[]>(`${this.apiUrl}/sessions`);
  }

  getSessionDetails(sessionId: number): Observable<Session> {
    return this.http.get<Session>(`${this.apiUrl}/sessions/${sessionId}`);
  }

  deleteSession(sessionId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/sessions/${sessionId}`);
  }

  openCheckIn(sessionId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/sessions/${sessionId}/check-in/open`, {});
  }

  closeCheckIn(sessionId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/sessions/${sessionId}/check-in/close`, {});
  }

  openCheckOut(sessionId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/sessions/${sessionId}/check-out/open`, {});
  }

  closeCheckOut(sessionId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/sessions/${sessionId}/check-out/close`, {});
  }

  // QR Code Generation
  generateCheckInQR(sessionId: number): Observable<QRResponse> {
    return this.http.post<QRResponse>(`${this.apiUrl}/sessions/${sessionId}/qr/check-in`, {});
  }

  generateCheckOutQR(sessionId: number): Observable<QRResponse> {
    return this.http.post<QRResponse>(`${this.apiUrl}/sessions/${sessionId}/qr/check-out`, {});
  }

  // Attendance Management
  getSessionAttendance(sessionId: number): Observable<SessionAttendance[]> {
    return this.http.get<SessionAttendance[]>(`${environment.apiUrl}/Session/${sessionId}/attendance`);
  }

  markManualAttendance(sessionId: number, request: ManualAttendanceRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/sessions/${sessionId}/mark-manual`, request);
  }

  // Student Management
  getAllStudents(): Observable<Student[]> {
    return this.http.get<Student[]>(`${this.apiUrl}/students`);
  }

  searchStudents(params: StudentSearchParams): Observable<Student[]> {
    const queryParams = new URLSearchParams();
    if (params.nationalId) queryParams.append('nationalId', params.nationalId);
    if (params.englishName) queryParams.append('englishName', params.englishName);
    if (params.arabicName) queryParams.append('arabicName', params.arabicName);
    
    const queryString = queryParams.toString();
    const url = queryString ? `${this.apiUrl}/students/search?${queryString}` : `${this.apiUrl}/students/search`;
    return this.http.get<Student[]>(url);
  }

  getTrackStudents(trackId: number): Observable<Student[]> {
    return this.http.get<Student[]>(`${this.apiUrl}/tracks/${trackId}/students`);
  }

  getPendingStudents(): Observable<Student[]> {
    return this.http.get<Student[]>(`${this.apiUrl}/students/pending`);
  }

  approveStudent(request: ApproveStudentRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/students/approve`, request);
  }

  // Instructor Profile
  changePassword(request: ChangePasswordRequest): Observable<any> {
    return this.http.put(`${this.apiUrl}/change-password`, request);
  }

  // Tracks
  getTracks(): Observable<Track[]> {
    return this.http.get<Track[]>(`${environment.apiUrl}/Track`);
  }

  getAttendanceSummary(trackId: number): Observable<AttendanceSummary[]> {
    return this.http.get<AttendanceSummary[]>(`${this.apiUrl}/tracks/${trackId}/attendance-summary`);
  }
}
