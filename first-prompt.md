You are a senior Angular engineer.

I already completed the backend of a QR-based Attendance Management System using .NET.
Your task is to build the Angular frontend and set up a clean, scalable Angular architecture.

=====================
PROJECT OVERVIEW
=====================

The system has three roles:
- Admin
- Instructor
- Student

Authentication is already implemented on the backend using JWT.

=====================
CORE SCENARIO
=====================

- Students register using their National ID as username.
- Students cannot log in until approved by Admin or Instructor.
- Admin can approve or reject instructor and student account requests.
- Instructors manage attendance sessions for specific tracks and groups.
- Each session has:
  - QR code for Check-In
  - QR code for Check-Out
- QR tokens expire every 60 seconds.
- The backend controls QR generation and expiration.
- The frontend only requests token from the backend and convert it to qr
- The backend returns a plain token string (example: 74052691d4d44359a28f437ff3c01c7f).
- The frontend is responsible for converting this token into a QR code and displaying it.
- Students scan the QR code to check in or check out.
- Instructors can manually mark attendance using the last 4 digits of a student's National ID.

=====================
FRONTEND REQUIREMENTS
=====================

- Angular (latest stable version)
- JWT-based authentication with route guards
- Role-based authorization (Admin, Instructor, Student)
- Clean folder structure
- HTTP Interceptors for token handling
- Reactive Forms with validation
- QR code generation from token (display only)
- Responsive UI

=====================
TASKS
=====================

1. Initialize and configure the Angular project.
2. Design a clean and maintainable folder structure.
3. Implement authentication flow and role-based guards.
4. Implement UI flows for Admin, Instructor, and Student roles.
5. Convert backend QR tokens into QR codes for display.
6. Integrate with backend APIs cleanly.
7. Follow best practices and clean code principles.

Provide production-ready code and explain key architectural decisions.  and start first with instructor module
 # Instructor Dashboard - API Documentation

## Base URL
```
https://nti.runasp.net
```

## Authentication
All endpoints require JWT Bearer token with Instructor or Admin role.

**Headers:**
```
Authorization: Bearer {your_jwt_token}
Content-Type: application/json
```

---

## 📋 Table of Contents
1. [Authentication](#authentication)
2. [Session Management](#session-management)
3. [QR Code Generation](#qr-code-generation-important)
4. [Attendance Management](#attendance-management)
5. [Student Management](#student-management)
6. [Instructor Profile](#instructor-profile)

---

## Authentication

### 1. Instructor Login
**POST** `/api/Auth/login`

**Request Body:**
```json
{
  "userName": "instructor.john",
  "password": "Instructor@123"
}
```

**Response (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "userId": "instructor-guid-123",
  "userName": "instructor.john",
  "email": "john.smith@example.com",
  "roles": ["Instructor"],
  "userType": "Instructor"
}
```

**Error Response (401 Unauthorized):**
```json
{
  "message": "Invalid credentials"
}
```

**Error Response (403 Forbidden - Not Approved):**
```json
{
  "message": "Your account is pending approval"
}
```

---

## Session Management



### 3. Create Session
**POST** `/api/Instructor/sessions`

**Request Body:**
```json
{
  "sessionName": "string",
  "trackId": 0,
  "sessionDate": "2026-01-17T04:44:59.408Z"
}
```

**Response (201 Created):**
```json
{
  "sessionId": 5,
  "trackId": 1,
  "trackName": "Full Stack .NET",
  "instructorId": "instructor-guid-123",
  "instructorName": "John Smith",
  "sessionDate": "2024-01-17T09:00:00Z",
  "checkInOpenedAt": null,
  "checkInClosedAt": null,
  "checkOutOpenedAt": null,
  "checkOutClosedAt": null,
  "description": "Introduction to Entity Framework Core",
  "createdAt": "2024-01-17T08:45:00Z"
}
```

**Validation Error (400 Bad Request):**
```json
{
  "errors": {
    "TrackId": ["Track ID is required"],
    "SessionDate": ["Session date must be in the future"]
  }
}
```

### 4. Get My Sessions
**GET** `/api/Instructor/sessions`

**Query Parameters:**

**Example:** `/api/Instructor/sessions

**Response (200 OK):**
```json
[
  {
    "sessionId": 5,
    "trackId": 1,
    "trackName": "Full Stack .NET",
    "instructorId": "instructor-guid-123",
    "instructorName": "John Smith",
    "sessionDate": "2024-01-17T09:00:00Z",
    "checkInOpenedAt": "2024-01-17T09:00:00Z",
    "checkInClosedAt": null,
    "checkOutOpenedAt": null,
    "checkOutClosedAt": null,
    "description": "Introduction to Entity Framework Core",
    "createdAt": "2024-01-17T08:45:00Z"
  }
]
```

### 5. Get Session Details
**GET** `/api/Instructor/sessions/{sessionId}`

**Example:** `/api/Instructor/sessions/5`

**Response (200 OK):**
```json
{
  "sessionId": 5,
  "trackId": 1,
  "trackName": "Full Stack .NET",
  "instructorId": "instructor-guid-123",
  "instructorName": "John Smith",
  "sessionDate": "2024-01-17T09:00:00Z",
  "checkInOpenedAt": "2024-01-17T09:00:00Z",
  "checkInClosedAt": null,
  "checkOutOpenedAt": null,
  "checkOutClosedAt": null,
  "description": "Introduction to Entity Framework Core",
  "createdAt": "2024-01-17T08:45:00Z"
}
```

### 6. Open Check-In
**POST** `/api/Instructor/sessions/{sessionId}/check-in/open`

**Example:** `/api/Instructor/sessions/5/check-in/open`

**Response (200 OK):**
```json
{
  "message": "Check-in opened successfully",
  "sessionId": 5,
  "checkInOpenedAt": "2024-01-17T09:00:00Z"
}
```

**Note:** After opening check-in, start calling the QR generation endpoint every 60 seconds.

### 7. Close Check-In
**POST** `/api/Instructor/sessions/{sessionId}/check-in/close`

**Example:** `/api/Instructor/sessions/5/check-in/close`

**Response (200 OK):**
```json
{
  "message": "Check-in closed successfully",
  "sessionId": 5,
  "checkInClosedAt": "2024-01-17T09:15:00Z"
}
```

**Note:** Stop calling the QR generation endpoint after closing check-in.

### 8. Open Check-Out
**POST** `/api/Instructor/sessions/{sessionId}/check-out/open`

**Example:** `/api/Instructor/sessions/5/check-out/open`

**Response (200 OK):**
```json
{
  "message": "Check-out opened successfully",
  "sessionId": 5,
  "checkOutOpenedAt": "2024-01-17T12:00:00Z"
}
```

**Note:** After opening check-out, start calling the QR generation endpoint every 60 seconds.

### 9. Close Check-Out
**POST** `/api/Instructor/sessions/{sessionId}/check-out/close`

**Example:** `/api/Instructor/sessions/5/check-out/close`

**Response (200 OK):**
```json
{
  "message": "Check-out closed successfully",
  "sessionId": 5,
  "checkOutClosedAt": "2024-01-17T12:15:00Z"
}
```

**Note:** Stop calling the QR generation endpoint after closing check-out.

---

## QR Code Generation (IMPORTANT)

### 10. Generate QR Code Token
**POST** `/api/Instructor/sessions/{sessionId}/generate-qr`

**Example:** `/api/Instructor/sessions/5/generate-qr`

**⚠️ CRITICAL WORKFLOW:**
```
1. Instructor opens check-in → Start timer
2. Every 60 seconds: Call this endpoint to get new QR token
3. Display QR code on instructor's screen
4. Students scan QR code to check in
5. Instructor closes check-in → Stop timer
6. Same process for check-out
```

**Response (200 OK):**
```json
{
  "token": "QR-5-1705485600-abc123xyz",
  "sessionId": 5,
  "generatedAt": "2024-01-17T09:00:00Z",
  "expiresAt": "2024-01-17T09:01:00Z",
  "validityInSeconds": 60
}
```

**Error Response (400 Bad Request - Session Not Open):**
```json
{
  "message": "Check-in or check-out must be open to generate QR code"
}
```

**Angular Implementation Example:**
```typescript
export class SessionComponent implements OnInit, OnDestroy {
  private qrRefreshInterval: any;
  currentQRToken: string = '';
  
  openCheckIn(sessionId: number) {
    this.sessionService.openCheckIn(sessionId).subscribe(() => {
      this.startQRGeneration(sessionId);
    });
  }
  
  startQRGeneration(sessionId: number) {
    // Generate immediately
    this.generateQR(sessionId);
    
    // Then every 60 seconds
    this.qrRefreshInterval = setInterval(() => {
      this.generateQR(sessionId);
    }, 60000); // 60 seconds
  }
  
  generateQR(sessionId: number) {
    this.sessionService.generateQR(sessionId).subscribe(response => {
      this.currentQRToken = response.token;
      // Display QR code using a library like ngx-qrcode or qrcode.js
    });
  }
  
  closeCheckIn(sessionId: number) {
    this.sessionService.closeCheckIn(sessionId).subscribe(() => {
      this.stopQRGeneration();
    });
  }
  
  stopQRGeneration() {
    if (this.qrRefreshInterval) {
      clearInterval(this.qrRefreshInterval);
      this.qrRefreshInterval = null;
    }
  }
  
  ngOnDestroy() {
    this.stopQRGeneration();
  }
}
```

---

## Attendance Management

### 11. Get Session Attendance
**GET** `/api/Instructor/sessions/{sessionId}/attendance`

**Example:** `/api/Instructor/sessions/5/attendance`

**Response (200 OK):**
```json
[
  {
    "attendanceId": 1,
    "sessionId": 5,
    "studentId": "student-guid-123",
    "studentName": "Ahmed Mohamed",
    "studentUserName": "student001",
    "checkInTime": "2024-01-17T09:05:00Z",
    "checkOutTime": "2024-01-17T12:10:00Z",
    "status": "Present",
    "recordedAt": "2024-01-17T09:05:00Z"
  },
  {
    "attendanceId": 2,
    "sessionId": 5,
    "studentId": "student-guid-456",
    "studentName": "Sara Ali",
    "studentUserName": "student002",
    "checkInTime": "2024-01-17T09:03:00Z",
    "checkOutTime": null,
    "status": "CheckedIn",
    "recordedAt": "2024-01-17T09:03:00Z"
  },
  {
    "attendanceId": 3,
    "sessionId": 5,
    "studentId": "student-guid-789",
    "studentName": "Omar Hassan",
    "studentUserName": "student003",
    "checkInTime": null,
    "checkOutTime": null,
    "status": "Absent",
    "recordedAt": null
  }
]
```

**Attendance Status Values:**
- `Present`: Student checked in and checked out
- `CheckedIn`: Student checked in but not yet checked out
- `Absent`: Student didn't check in
- `Late`: Student checked in after grace period
- `LeftEarly`: Student checked out before minimum time

### 12. Get Track Students
**GET** `/api/Instructor/tracks/{trackId}/students`

**Example:** `/api/Instructor/tracks/1/students`

**Response (200 OK):**
```json
[
  {
    "studentId": "student-guid-123",
    "userName": "student001",
    "email": "student001@example.com",
    "fullName": "Ahmed Mohamed",
    "phoneNumber": "+201234567890",
    "trackId": 1,
    "trackName": "Full Stack .NET",
    "isApproved": true,
    "approvedBy": "admin",
    "approvedAt": "2024-01-16T10:00:00Z",
    "createdAt": "2024-01-15T08:00:00Z"
  }
]
```

---

## Student Management

### 13. Get Pending Students (For Approval)
**GET** `/api/Instructor/students/pending`

**Query Parameters:**
- `trackId` (optional): Filter by track ID

**Example:** `/api/Instructor/students/pending?trackId=1`

**Response (200 OK):**
```json
[
  {
    "studentId": "student-guid-999",
    "userName": "student999",
    "email": "student999@example.com",
    "fullName": "New Student",
    "phoneNumber": "+201111111111",
    "trackId": 1,
    "trackName": "Full Stack .NET",
    "isApproved": false,
    "approvedBy": null,
    "approvedAt": null,
    "createdAt": "2024-01-17T09:00:00Z"
  }
]
```

### 14. Approve/Reject Student
**PUT** `/api/Instructor/students/approve`

**Request Body (Approve):**
```json
{
  "studentId": "student-guid-999",
  "isApproved": true
}
```

**Request Body (Reject):**
```json
{
  "studentId": "student-guid-999",
  "isApproved": false
}
```

**Response (200 OK):**
```json
{
  "studentId": "student-guid-999",
  "userName": "student999",
  "email": "student999@example.com",
  "fullName": "New Student",
  "phoneNumber": "+201111111111",
  "trackId": 1,
  "trackName": "Full Stack .NET",
  "isApproved": true,
  "approvedBy": "instructor.john",
  "approvedAt": "2024-01-17T11:30:00Z",
  "createdAt": "2024-01-17T09:00:00Z"
}
```

### 15. Reset Student Password
**POST** `/api/Instructor/students/reset-password`

**Request Body:**
```json
{
  "studentId": "student-guid-123",
  "newPassword": "NewPassword@123"
}
```

**Response (200 OK):**
```json
{
  "message": "Password reset successfully for student: student001"
}
```

---

## Instructor Profile




### 18. Change My Password
**PUT** `/api/Instructor/change-password`

**Request Body:**
```json
{
  "newPassword": "NewSecurePassword@789"
}
```

**Response (200 OK):**
```json
{
  "message": "Password changed successfully"
}
```

**Validation Error (400 Bad Request):**
```json
{
  "errors": {
    "NewPassword": [
      "Password must be at least 8 characters long",
      "Password must contain at least one uppercase letter",
      "Password must contain at least one digit",
      "Password must contain at least one special character"
    ]
  }
}
```

---

## Complete Session Workflow

### Typical Session Flow:

```
1. BEFORE CLASS:

   
   POST /api/Instructor/sessions
   → Create session for today
   {
     "trackId": 1,
     "sessionDate": "2024-01-17T09:00:00Z",
     "description": "Today's Topic"
   }

2. START OF CLASS (Check-In):
   POST /api/Instructor/sessions/5/check-in/open
   → Open check-in
   
   Start Timer: Every 60 seconds
   POST /api/Instructor/sessions/5/generate-qr
   → Get new QR token
   → Display QR code on screen
   
   Students scan QR code to check in

/api/Instructor/sessions/5/check-in/close
   → Close check-in
   
   
   GET /api/Instructor/sessions/5/attendance
   → Check who attended

4. END OF CLASS (Check-Out):
   POST /api/Instructor/sessions/5/check-out/open
   → Open check-out
   
   Start Timer: Every 60 seconds
   POST /api/Instructor/sessions/5/generate-qr
   → Get new QR token
   → Display QR code on screen
   
   Students scan QR code to check out


   POST /api/Instructor/sessions/5/check-out/close
   → Close check-out
   Stop Timer
   
   GET /api/Instructor/sessions/5/attendance
   → View final attendance report
```

---

## Error Responses

### Common Error Codes

**400 Bad Request:**
```json
{
  "message": "Check-in is already open for this session"
}
```

**401 Unauthorized:**
```json
{
  "message": "Invalid or expired token"
}
```

**403 Forbidden:**
```json
{
  "message": "You don't have permission to access this session"
}
```

**404 Not Found:**
```json
{
  "message": "Session not found"
}
```

**500 Internal Server Error:**
```json
{
  "message": "An error occurred while processing your request"
}
```

---

## Notes for Frontend Team

### QR Code Generation Best Practices:

1. **Timer Management:**
   - Use `setInterval()` with 60000ms (60 seconds)
   - Clear interval when component unmounts
   - Clear interval when check-in/check-out closes

2. **Error Handling:**
   - If QR generation fails, retry after 5 seconds
   - Show error message to instructor
   - Keep trying until successful or session closed

3. **Display:**
   - Show QR code prominently on screen
   - Display expiry countdown (60 seconds)
   - Show session status (open/closed)
   - Display student count who checked in

4. **Libraries for QR Code:**
   - Angular: `ngx-qrcode2` or `angularx-qrcode`
   - Generate QR from token string
   - Set size to 300x300 or larger

5. **Real-time Updates:**
   - Consider polling attendance endpoint every 30 seconds
   - Show live student check-in notifications
   - Update attendance count in real-time

### Example Angular Service:

```typescript
@Injectable({ providedIn: 'root' })
export class SessionService {
  
  generateQR(sessionId: number): Observable<QRResponse> {
    return this.http.post<QRResponse>(
      `${this.apiUrl}/sessions/${sessionId}/generate-qr`,
      {}
    );
  }
  
  openCheckIn(sessionId: number): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/sessions/${sessionId}/check-in/open`,
      {}
    );
  }
  
  closeCheckIn(sessionId: number): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/sessions/${sessionId}/check-in/close`,
      {}
    );
  }
  
  getAttendance(sessionId: number): Observable<AttendanceRecord[]> {
    return this.http.get<AttendanceRecord[]>(
      `${this.apiUrl}/sessions/${sessionId}/attendance`
    );
  }
}
```
and use this endpoint to make instructor attend student in session manuallyPOST
/api/Instructor/sessions/{sessionId}/mark-manual and this endpoint  and the requested body is : {
  "sessionId": 0,
  "lastFourDigits": "0318",
  "attendanceType": "string"
}