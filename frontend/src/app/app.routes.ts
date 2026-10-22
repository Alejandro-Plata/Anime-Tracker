import { Routes } from '@angular/router';
import { authGuard } from './guards/auth-guard';

// Cada página se carga bajo demanda para que el paquete inicial solo lleve el marco de la app
export const routes: Routes = [
    { path: '', loadComponent: () => import('./pages/landing-page/landing-page').then(m => m.LandingPage) },
    { path: 'register', loadComponent: () => import('./pages/register/register').then(m => m.Register) },
    { path: 'login', loadComponent: () => import('./pages/login/login').then(m => m.Login) },
    { path: 'forgot-password', loadComponent: () => import('./pages/forgot-password/forgot-password').then(m => m.ForgotPassword) },
    { path: 'dashboard', loadComponent: () => import('./pages/inicio/inicio').then(m => m.Inicio), canActivate: [authGuard] },
    { path: 'dashboard/descubrir', loadComponent: () => import('./pages/descubrir/descubrir').then(m => m.Descubrir), canActivate: [authGuard] },
    { path: 'dashboard/buscador', loadComponent: () => import('./pages/buscador-avanzado/buscador-avanzado').then(m => m.BuscadorAvanzado), canActivate: [authGuard] },
    { path: 'dashboard/mi-lista', loadComponent: () => import('./pages/mi-lista/mi-lista').then(m => m.MiLista), canActivate: [authGuard] },
    { path: 'dashboard/perfil', loadComponent: () => import('./pages/perfil/perfil').then(m => m.Perfil), canActivate: [authGuard] },
    { path: 'dashboard/anime/:id', loadComponent: () => import('./pages/anime-detail/anime-detail').then(m => m.AnimeDetailPage), canActivate: [authGuard] }
];
