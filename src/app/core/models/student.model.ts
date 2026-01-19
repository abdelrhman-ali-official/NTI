// Student Registration
export interface StudentRegistrationRequest {
  nationalId: string;
  fullNameArabic: string;
  fullNameEnglish: string;
  password: string;
  trackId: number;
  email: string;
}

// Student Status
export interface StudentStatusResponse {
  status: 'Pending' | 'Approved' | 'Rejected';
  canLogin: boolean;
  message: string;
}

// Student Profile
export interface StudentProfile {
  id: string;
  nationalId: string;
  fullNameArabic: string;
  fullNameEnglish: string;
  email: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  registeredAt: string;
  approvedAt: string | null;
  approvedBy: string | null;
  track: {
    id: number;
    name: string;
    description: string;
    isActive: boolean;
    studentCount: number;
  };
}

// Active Sessions
export interface ActiveSession {
  id: number;
  sessionName: string;
  sessionDate: string;
  createdAt: string;
  isCheckInOpen: boolean;
  isCheckOutOpen: boolean;
  checkInOpenedAt: string | null;
  checkInClosedAt: string | null;
  checkOutOpenedAt: string | null;
  checkOutClosedAt: string | null;
  instructor: {
    id: string;
    userName: string;
    fullName: string;
    email: string;
    isApproved: boolean;
    createdAt: string;
    approvedAt: string | null;
    approvedBy: string | null;
    tracks: any[];
  };
  track: {
    id: number;
    name: string;
    description: string;
    isActive: boolean;
    studentCount: number;
  };
  totalCheckIns: number;
  totalCheckOuts: number;
}

// QR Attendance
export interface QRAttendanceRequest {
  qrToken: string;
}

// Attendance Record
export interface StudentAttendanceRecord {
  attendanceId: number;
  sessionId: number;
  sessionName: string;
  sessionDate: string;
  student: any | null;
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

// Change Password
export interface ChangePasswordRequest {
  newPassword: string;
}
