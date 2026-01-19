// Session Models
export interface Session {
  id: number;
  sessionId: number;
  sessionName: string;
  sessionDate: string;
  createdAt: string;
  isCheckInOpen: boolean;
  isCheckOutOpen: boolean;
  checkInOpenedAt: string | null;
  checkInClosedAt: string | null;
  checkOutOpenedAt: string | null;
  checkOutClosedAt: string | null;
  instructor: any | null;
  track: Track;
  trackName?: string;
  description?: string;
  totalCheckIns: number;
  totalCheckOuts: number;
}

export interface CreateSessionRequest {
  sessionName: string;
  trackId: number;
  sessionDate: string;
}

export interface CreateHistoricalSessionRequest {
  trackId: number;
  sessionDate: string;
  sessionTitle: string;
  attendedStudentLastFourDigits: string[];
}

export interface QRResponse {
  token: string;
  type: 'CheckIn' | 'CheckOut';
  expiresAt: string;
  expiresInSeconds: number;
}

export interface AttendanceRecord {
  attendanceId: number;
  sessionId: number;
  sessionName: string;
  sessionDate: string;
  student: {
    id: string;
    name: string;
    nationalId: string;
  };
  checkIn: {
    at: string | null;
    method: 'QR' | 'Manual';
    markedBy: string | null;
  } | null;
  checkOut: {
    at: string | null;
    method: 'QR' | 'Manual';
    markedBy: string | null;
  } | null;
  isCheckedOut: boolean;
}

export interface ManualAttendanceRequest {
  sessionId: number;
  lastFourDigits: string;
  attendanceType: 'CheckIn' | 'CheckOut';
}

export interface Student {
  id: string;
  nationalId: string;
  fullNameArabic: string;
  fullNameEnglish: string;
  email: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  registeredAt: string;
  approvedAt: string | null;
  approvedBy: string | null;
  track: Track | null;
}

export interface ApproveStudentRequest {
  studentId: string;
  approve: boolean;
  trackId: number;
}

export interface AttendanceSummary {
  studentId: string;
  studentName: string;
  nationalId: string;
  totalCheckIns: number;
  totalCheckOuts: number;
  totalSessions: number;
}

export interface StudentSearchParams {
  nationalId?: string;
  englishName?: string;
  arabicName?: string;
}

export interface ChangePasswordRequest {
  newPassword: string;
}

// Attendance Models
export interface SessionAttendance {
  attendanceId: number;
  sessionId: number;
  sessionName: string;
  sessionDate: string;
  student: {
    id: string;
    name: string;
    nationalId: string;
  };
  checkIn: {
    at: string | null;
    method: 'QR' | 'Manual';
    markedBy: string | null;
  } | null;
  checkOut: {
    at: string | null;
    method: 'QR' | 'Manual';
    markedBy: string | null;
  } | null;
  isCheckedOut: boolean;
}

// Track Model
export interface Track {
  id: number;
  trackId: number;
  name: string;
  trackName: string;
  description?: string;
  isActive: boolean;
  studentCount: number;
}
