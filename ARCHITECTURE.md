# Angular Architecture Documentation

## 📐 Architecture Overview

This Angular application follows **Clean Architecture** principles with a clear separation of concerns and modular design.

## 🏛️ Layer Structure

### 1. Core Layer (`/core`)
**Purpose**: Singleton services, guards, interceptors, and models used throughout the app.

**Contents**:
- **Guards**: Authentication and role-based authorization
- **Interceptors**: HTTP request/response handling (JWT tokens)
- **Models**: TypeScript interfaces and types
- **Services**: Core business logic (AuthService)

**Key Decision**: Core is provided at root level and imported only once in the app.

### 2. Features Layer (`/features`)
**Purpose**: Feature-specific modules with their own components and services.

**Structure**:
```
features/
├── auth/           # Authentication feature
├── instructor/     # Instructor feature
├── admin/          # (Future) Admin feature
└── student/        # (Future) Student feature
```

**Key Decision**: Each feature is self-contained with its own services and components. Uses **lazy loading** for better performance.

### 3. Shared Layer (`/shared`)
**Purpose**: Reusable components, directives, and pipes used across features.

**Key Decision**: Only truly shared components go here. Feature-specific components stay in their feature folders.

---

## 🔑 Key Architectural Decisions

### 1. Standalone Components (Angular 18+)
**Decision**: Use standalone components throughout the application.

**Rationale**:
- ✅ Better tree-shaking and smaller bundle sizes
- ✅ Simpler dependency management
- ✅ No need for NgModules
- ✅ Easier lazy loading
- ✅ Modern Angular best practice

**Example**:
```typescript
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html'
})
export class LoginComponent {}
```

### 2. Reactive Forms over Template-driven Forms
**Decision**: Use Reactive Forms for all user inputs.

**Rationale**:
- ✅ Better type safety
- ✅ More testable
- ✅ Explicit validation logic
- ✅ Better for complex forms

**Example**:
```typescript
this.loginForm = this.fb.group({
  userName: ['', Validators.required],
  password: ['', Validators.required]
});
```

### 3. Service-based State Management
**Decision**: Use BehaviorSubject in services instead of NgRx or similar.

**Rationale**:
- ✅ Simpler for current app complexity
- ✅ Less boilerplate
- ✅ Easier to learn and maintain
- ✅ Can migrate to NgRx later if needed

**Example**:
```typescript
private currentUserSubject = new BehaviorSubject<User | null>(null);
public currentUser$ = this.currentUserSubject.asObservable();
```

### 4. Path Aliases
**Decision**: Use TypeScript path aliases for imports.

**Configuration** (`tsconfig.json`):
```json
"paths": {
  "@core/*": ["src/app/core/*"],
  "@shared/*": ["src/app/shared/*"],
  "@features/*": ["src/app/features/*"],
  "@environments/*": ["src/environments/*"]
}
```

**Rationale**:
- ✅ Cleaner imports
- ✅ Easier refactoring
- ✅ No relative path hell (`../../..`)

**Example**:
```typescript
import { AuthService } from '@core/services/auth.service';
import { environment } from '@environments/environment';
```

### 5. Functional Guards (Angular 15+)
**Decision**: Use functional route guards instead of class-based guards.

**Rationale**:
- ✅ More concise
- ✅ Functional programming approach
- ✅ Easier to test
- ✅ Modern Angular standard

**Example**:
```typescript
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  return authService.isAuthenticated();
};
```

### 6. HTTP Interceptor for Authentication
**Decision**: Centralize JWT token handling in an HTTP interceptor.

**Rationale**:
- ✅ DRY principle - no need to add token to every request
- ✅ Centralized error handling
- ✅ Automatic token refresh (future enhancement)
- ✅ Cleaner service code

**Implementation**:
```typescript
intercept(request: HttpRequest<any>, next: HttpHandler) {
  const token = this.authService.getToken();
  if (token) {
    request = request.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }
  return next.handle(request);
}
```

### 7. QR Code Service Pattern
**Decision**: Create a dedicated service for QR code generation logic.

**Rationale**:
- ✅ Separation of concerns
- ✅ Reusable across components
- ✅ Encapsulates complex timer logic
- ✅ Easier to test

**Key Features**:
- Auto-refresh every 60 seconds
- Cleanup on destroy
- Error handling with retry
- Observable-based state management

**Implementation**:
```typescript
startQRGeneration(sessionId: number): void {
  // Generate immediately
  this.generateQR();
  
  // Then every 60 seconds
  interval(60000)
    .pipe(takeUntil(this.destroy$))
    .subscribe(() => this.generateQR());
}
```

### 8. Environment-based Configuration
**Decision**: Use Angular environment files for configuration.

**Files**:
- `environment.ts` - Development
- `environment.prod.ts` - Production

**Rationale**:
- ✅ Easy to switch between environments
- ✅ No hardcoded URLs
- ✅ Build-time configuration

### 9. Lazy Loading Strategy
**Decision**: Lazy load feature modules using route configuration.

**Rationale**:
- ✅ Smaller initial bundle
- ✅ Faster initial load
- ✅ Load on demand

**Example**:
```typescript
{
  path: 'instructor',
  loadComponent: () => import('./features/instructor/...')
}
```

### 10. Memory Leak Prevention
**Decision**: Use `takeUntil` pattern for subscription management.

**Rationale**:
- ✅ Prevents memory leaks
- ✅ Automatic cleanup
- ✅ Clean code pattern

**Implementation**:
```typescript
private destroy$ = new Subject<void>();

ngOnInit() {
  this.service.data$
    .pipe(takeUntil(this.destroy$))
    .subscribe(data => { /* ... */ });
}

ngOnDestroy() {
  this.destroy$.next();
  this.destroy$.complete();
}
```

---

## 🔄 Data Flow

### Authentication Flow
```
1. User enters credentials
2. LoginComponent → AuthService.login()
3. AuthService → HTTP POST to backend
4. Backend returns JWT token + user data
5. AuthService stores in localStorage
6. AuthService updates BehaviorSubject
7. Router navigates based on user role
8. All subsequent requests include JWT (via Interceptor)
```

### Session Management Flow
```
1. Instructor creates session
2. CreateSessionComponent → InstructorService.createSession()
3. Navigate to SessionManagementComponent
4. Instructor opens check-in
5. SessionManagementComponent → InstructorService.openCheckIn()
6. QRCodeService.startQRGeneration() triggered
7. Every 60s: QRCodeService → InstructorService.generateQR()
8. Backend returns new token
9. QRCodeService updates BehaviorSubject
10. Component displays updated QR code
11. Students scan QR code (handled by backend)
12. Instructor closes check-in
13. QRCodeService.stopQRGeneration() called
```

---

## 🎯 Design Patterns Used

### 1. **Singleton Pattern**
Used for services provided in root.
```typescript
@Injectable({ providedIn: 'root' })
```

### 2. **Observer Pattern**
RxJS Observables and Subjects throughout the app.
```typescript
currentUser$ = this.currentUserSubject.asObservable();
```

### 3. **Facade Pattern**
Services act as facades to backend APIs.
```typescript
InstructorService abstracts all instructor-related API calls
```

### 4. **Strategy Pattern**
Different authentication strategies based on user role.

### 5. **Dependency Injection**
Angular's built-in DI system for all services and dependencies.

---

## 🛡️ Security Considerations

### 1. **JWT Storage**
- Stored in localStorage (consider httpOnly cookies for enhanced security)
- Automatically cleared on logout
- Validated on every request

### 2. **Route Protection**
- Guards prevent unauthorized access
- Role-based authorization
- Redirect to login if not authenticated

### 3. **Input Validation**
- Reactive forms with validators
- Server-side validation (handled by backend)
- Sanitization of user inputs

### 4. **Error Handling**
- Centralized in HTTP interceptor
- User-friendly error messages
- No sensitive data in error messages

---

## 📊 Performance Optimizations

### 1. **Lazy Loading**
Feature modules loaded on demand.

### 2. **OnPush Change Detection** (Future)
Can be implemented for performance-critical components.

### 3. **TrackBy Functions** (Future)
For ngFor loops to improve rendering performance.

### 4. **Bundle Size**
- Standalone components for better tree-shaking
- No unnecessary dependencies

---

## 🧪 Testing Strategy (Future Implementation)

### Unit Tests
- Services: Test business logic
- Components: Test component behavior
- Guards: Test authorization logic

### Integration Tests
- Test service-component interaction
- Test routing and navigation

### E2E Tests
- Test complete user workflows
- Critical paths (login, session creation, QR scanning)

---

## 🔮 Future Enhancements

### 1. State Management
Migrate to NgRx/Akita when app grows more complex.

### 2. PWA Support
Add service workers for offline functionality.

### 3. Real-time Updates
WebSocket integration for live attendance updates.

### 4. Advanced Caching
Implement HTTP caching strategies.

### 5. Internationalization (i18n)
Multi-language support.

### 6. Accessibility (a11y)
WCAG 2.1 compliance.

---

## 📚 Code Style Guidelines

### Naming Conventions
- **Components**: PascalCase with `.component` suffix
- **Services**: PascalCase with `.service` suffix
- **Variables**: camelCase
- **Constants**: UPPER_SNAKE_CASE
- **Interfaces**: PascalCase with descriptive names

### File Organization
```
component-name/
├── component-name.component.ts
├── component-name.component.html
├── component-name.component.css
```

### Import Order
1. Angular core imports
2. Third-party imports
3. Application imports (using path aliases)

---

## 🎓 Learning Resources

- [Angular Official Docs](https://angular.io/docs)
- [RxJS Documentation](https://rxjs.dev/)
- [Angular Architecture Best Practices](https://angular.io/guide/architecture)
- [Angular Security Guide](https://angular.io/guide/security)

---

**This architecture is designed to be scalable, maintainable, and follows Angular best practices.**
