import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth-service';

// Solo deja entrar al dashboard si hay un token guardado; si no, redirige al login
export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.isLoggedIn() ? true : router.createUrlTree(['/login']);
};
