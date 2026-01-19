import { Routes } from '@angular/router';
import { authGuard, roleGuard } from './core/guards/auth.guard';
import { studentGuard } from './core/guards/student.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/auth/login',
    pathMatch: 'full'
  },
  {
    path: 'auth/login',
    loadComponent: () => import('./features/auth/components/login/login.component')
      .then(m => m.LoginComponent)
  },
  {
    path: 'instructor',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['Instructor', 'Admin'] },
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/instructor/components/instructor-dashboard/instructor-dashboard.component')
          .then(m => m.InstructorDashboardComponent)
      },
      {
        path: 'sessions/new',
        loadComponent: () => import('./features/instructor/components/create-session/create-session.component')
          .then(m => m.CreateSessionComponent)
      },
      {
        path: 'sessions/:id',
        loadComponent: () => import('./features/instructor/components/session-management/session-management.component')
          .then(m => m.SessionManagementComponent)
      }
    ]
  },
  {
    path: 'student',
    children: [
      {
        path: 'register',
        loadComponent: () => import('./features/student/components/registration/registration.component')
          .then(m => m.RegistrationComponent)
      },
      {
        path: 'status',
        loadComponent: () => import('./features/student/components/status-check/status-check.component')
          .then(m => m.StatusCheckComponent)
      },
      {
        path: 'dashboard',
        canActivate: [authGuard, studentGuard],
        loadComponent: () => import('./features/student/components/dashboard/dashboard.component')
          .then(m => m.StudentDashboardComponent)
      },
      {
        path: 'attendance-history',
        canActivate: [authGuard, studentGuard],
        loadComponent: () => import('./features/student/components/attendance-history/attendance-history.component')
          .then(m => m.AttendanceHistoryComponent)
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: 'unauthorized',
    loadComponent: () => import('./shared/components/unauthorized/unauthorized.component')
      .then(m => m.UnauthorizedComponent)
  },
  {
    path: '**',
    redirectTo: '/auth/login'
  }
];
