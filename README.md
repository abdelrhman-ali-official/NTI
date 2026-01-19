# NTI Attendance System - Frontend

A modern Angular application for QR-based attendance management system.

## 🎯 Features

### Instructor Module (Completed)
- ✅ Session Management
- ✅ QR Code Generation (Auto-refresh every 60 seconds)
- ✅ Real-time Attendance Tracking
- ✅ Manual Attendance Marking
- ✅ Student Approval Workflow
- ✅ Dashboard with Session Overview

### Authentication & Security
- ✅ JWT-based Authentication
- ✅ Role-based Authorization (Admin, Instructor, Student)
- ✅ HTTP Interceptors for Token Management
- ✅ Route Guards

## 🏗️ Architecture

### Clean Folder Structure
```
src/
├── app/
│   ├── core/                    # Core services, guards, interceptors
│   │   ├── guards/
│   │   │   └── auth.guard.ts
│   │   ├── interceptors/
│   │   │   └── auth.interceptor.ts
│   │   ├── models/
│   │   │   ├── auth.model.ts
│   │   │   └── instructor.model.ts
│   │   └── services/
│   │       └── auth.service.ts
│   │
│   ├── features/                # Feature modules
│   │   ├── auth/
│   │   │   └── components/
│   │   │       └── login/
│   │   │
│   │   └── instructor/
│   │       ├── components/
│   │       │   ├── instructor-dashboard/
│   │       │   ├── session-management/
│   │       │   └── create-session/
│   │       └── services/
│   │           ├── instructor.service.ts
│   │           └── qr-code.service.ts
│   │
│   ├── shared/                  # Shared components
│   │   └── components/
│   │       └── unauthorized/
│   │
│   ├── app.component.ts
│   ├── app.config.ts
│   └── app.routes.ts
│
├── environments/
│   ├── environment.ts
│   └── environment.prod.ts
│
├── index.html
├── main.ts
└── styles.css
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v20.19 or higher)
- npm (v9.8 or higher)
- Angular CLI (optional, for development)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm start
```

The application will open at `http://localhost:4200/`

### Build for Production

```bash
npm run build
```

Build artifacts will be stored in the `dist/` directory.

## 🔑 API Configuration

The backend API is configured in `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  apiUrl: 'https://nti.runasp.net/api'
};
```

## 📱 Key Features Implementation

### QR Code Generation
The QR code service automatically:
- Generates a new QR code token every 60 seconds
- Displays a countdown timer
- Handles errors with automatic retry
- Stops generation when session is closed

```typescript
// Auto-refresh implementation
interval(60000)
  .pipe(takeUntil(this.destroy$))
  .subscribe(() => this.generateQR());
```

### Session Management Workflow

1. **Create Session** → Select track and schedule
2. **Open Check-In** → Auto-start QR generation
3. **Students Scan QR** → Attendance recorded
4. **Close Check-In** → Stop QR generation
5. **Open Check-Out** → Resume QR generation
6. **Close Check-Out** → Session complete

### Manual Attendance
Instructors can mark attendance using the last 4 digits of a student's National ID when:
- QR code scanning fails
- Student forgot device
- Technical issues occur

## 🎨 UI/UX Design

- **Responsive Design** - Works on desktop, tablet, and mobile
- **Clean Interface** - Minimalist, intuitive navigation
- **Real-time Updates** - Live attendance count and status
- **Visual Feedback** - Loading states, error messages, success notifications
- **Color-coded Status** - Easy identification of session states

## 🔐 Security Features

1. **JWT Authentication** - Secure token-based auth
2. **HTTP Interceptor** - Automatic token attachment
3. **Route Guards** - Protected routes by role
4. **Auto-logout** - On 401 responses
5. **Secure Storage** - LocalStorage for tokens

## 📋 User Roles

### Instructor Credentials (Test)
```
Username: instructor.john
Password: Instructor@123
```

### Role-based Access
- **Admin** - Full system access
- **Instructor** - Session and attendance management
- **Student** - View sessions and check in/out

## 🛠️ Technologies Used

- **Angular 18** - Latest stable version
- **TypeScript** - Type-safe development
- **RxJS** - Reactive programming
- **angularx-qrcode** - QR code generation
- **Standalone Components** - Modern Angular architecture
- **Reactive Forms** - Form validation and handling

## 📦 Dependencies

```json
{
  "@angular/core": "^18.0.0",
  "@angular/router": "^18.0.0",
  "@angular/forms": "^18.0.0",
  "angularx-qrcode": "^18.0.0",
  "rxjs": "~7.8.0"
}
```

## 🎯 Next Steps (Future Development)

### Admin Module
- User management
- Track management
- System settings
- Reports and analytics

### Student Module
- View assigned sessions
- Scan QR code for check-in/out
- View attendance history
- Profile management

### Additional Features
- Email notifications
- Attendance reports (PDF/Excel)
- Analytics dashboard
- Multi-language support

## 🐛 Known Issues

None at this time. Please report issues on the project repository.

## 📄 License

This project is part of the NTI attendance management system.

## 👨‍💻 Development Notes

### Code Standards
- **Naming Convention** - camelCase for variables, PascalCase for classes
- **File Structure** - One component per file
- **Type Safety** - Strict TypeScript enabled
- **Code Reusability** - Shared services and components
- **Error Handling** - Comprehensive error management

### Best Practices Followed
✅ Lazy loading for feature modules  
✅ OnPush change detection (where applicable)  
✅ Unsubscribe from observables (using takeUntil)  
✅ Reactive forms with validation  
✅ HTTP interceptors for cross-cutting concerns  
✅ Environment-based configuration  
✅ Clean separation of concerns  
✅ Standalone components for better tree-shaking  

## 🚦 API Integration

All API endpoints are documented in the `first-prompt.md` file. Key endpoints:

- **Authentication**: `/api/Auth/login`
- **Sessions**: `/api/Instructor/sessions`
- **QR Generation**: `/api/Instructor/sessions/{id}/generate-qr`
- **Attendance**: `/api/Instructor/sessions/{id}/attendance`

## 📞 Support

For technical support or questions, please contact the development team.

---

**Built with ❤️ using Angular**
