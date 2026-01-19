# Quick Start Guide

## 🚀 Getting Started

### Prerequisites
- Node.js v20.19+ (you have v18.18.0 - update recommended but app will work)
- npm 9.8+

### Installation & Running

1. **Install dependencies** (already done):
```bash
npm install
```

2. **Start development server**:
```bash
npm start
```

The app will be available at: `http://localhost:4200/`

3. **Build for production**:
```bash
npm run build
```

---

## 🔐 Test Credentials

### Instructor Login
```
Username: instructor.john
Password: Instructor@123
```

---

## 📱 Application Flow

### For Instructors:

1. **Login** → `/auth/login`
2. **Dashboard** → View all your sessions
3. **Create Session** → Click "Create New Session"
   - Enter session name
   - Select track
   - Set date/time
4. **Manage Session** → Click on a session card
   - Open Check-In → QR code auto-generates every 60s
   - Students scan QR to check in
   - Close Check-In when done
   - Open Check-Out → QR code regenerates
   - Students scan to check out
   - Close Check-Out → Session complete
5. **View Attendance** → See who checked in/out
6. **Manual Attendance** → Use last 4 digits of National ID

---

## 🗂️ Project Structure

```
src/app/
├── core/                           # Singleton services
│   ├── guards/auth.guard.ts       # Route protection
│   ├── interceptors/              # HTTP interceptors
│   ├── models/                    # TypeScript interfaces
│   └── services/auth.service.ts   # Authentication
│
├── features/
│   ├── auth/login/                # Login component
│   └── instructor/
│       ├── dashboard/             # Session list
│       ├── create-session/        # Create new session
│       ├── session-management/    # QR code & attendance
│       └── services/
│           ├── instructor.service.ts  # API calls
│           └── qr-code.service.ts     # QR generation logic
│
└── shared/
    └── unauthorized/              # 403 page
```

---

## 🔧 Configuration

### API Endpoint
Located in `src/environments/environment.ts`:
```typescript
export const environment = {
  production: false,
  apiUrl: 'https://nti.runasp.net/api'
};
```

### Change API URL
Edit the `apiUrl` value to point to your backend.

---

## 🎯 Key Features Implemented

### ✅ Authentication
- JWT-based login
- Token stored in localStorage
- Auto-redirect based on role
- Auto-logout on 401

### ✅ Instructor Dashboard
- List all sessions
- Status indicators (active, completed, scheduled)
- Quick navigation to session management

### ✅ Session Management
- Create new sessions
- Open/close check-in
- Open/close check-out
- View real-time attendance
- Manual attendance marking

### ✅ QR Code Generation
- Auto-generates every 60 seconds
- Countdown timer display
- Auto-stop on session close
- Error handling with retry

### ✅ Route Protection
- Auth guard for authenticated routes
- Role guard for role-based access
- Unauthorized page for denied access

---

## 🐛 Troubleshooting

### Port already in use
```bash
# Kill process on port 4200
npx kill-port 4200
# Then restart
npm start
```

### Dependencies issues
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
```

### Build errors
```bash
# Clear Angular cache
rm -rf .angular/cache
npm start
```

---

## 📦 Available Scripts

```bash
npm start          # Start dev server (ng serve)
npm run build      # Build for production
npm run watch      # Build in watch mode
```

---

## 🌐 Navigation Routes

```
/                              → Redirects to login
/auth/login                    → Login page
/instructor/dashboard          → Instructor dashboard
/instructor/sessions/new       → Create session
/instructor/sessions/:id       → Manage session
/unauthorized                  → Access denied page
```

---

## 📝 API Integration

All API calls are in:
- `src/app/core/services/auth.service.ts`
- `src/app/features/instructor/services/instructor.service.ts`

Example API call:
```typescript
this.instructorService.getMySessions().subscribe({
  next: (sessions) => {
    // Handle response
  },
  error: (error) => {
    // Handle error
  }
});
```

---

## 🎨 Styling

Global styles in `src/styles.css`
Component-specific styles in component `.css` files

---

## 🔮 Next Steps

1. **Update Node.js** to v20.19+ for full compatibility
2. **Test the application** with real backend
3. **Implement Admin module** (if required)
4. **Implement Student module** (if required)
5. **Add unit tests**
6. **Deploy to production**

---

## 📞 Support

For issues or questions:
1. Check [ARCHITECTURE.md](ARCHITECTURE.md) for design decisions
2. Check [README.md](README.md) for full documentation
3. Review code comments in source files

---

**Happy Coding! 🚀**
