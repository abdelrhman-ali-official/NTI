import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map } from 'rxjs';

export const studentGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.currentUser$.pipe(
    map(currentUser => {
      if (currentUser && currentUser.userType === 'Student') {
        return true;
      }
      router.navigate(['/unauthorized']);
      return false;
    })
  );
};
