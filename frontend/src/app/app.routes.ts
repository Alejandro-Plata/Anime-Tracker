import { Routes } from '@angular/router';
import { LandingPage } from './pages/landing-page/landing-page';
import { Descubrir } from './pages/descubrir/descubrir';
import { BuscadorAvanzado } from './pages/buscador-avanzado/buscador-avanzado';
import { MiLista } from './pages/mi-lista/mi-lista';
import { Login } from './pages/login/login';
import { Register } from './pages/register/register';
import { AnimeDetailPage } from './pages/anime-detail/anime-detail';
import { ForgotPassword } from './pages/forgot-password/forgot-password';
import { authGuard } from './guards/auth-guard';

export const routes: Routes = [
    { path: '', component: Register },
    { path: 'register', component: Register },
    { path: 'login', component: Login },
    { path: 'forgot-password', component: ForgotPassword },
    { path: 'dashboard', component: LandingPage, canActivate: [authGuard] },
    { path: 'dashboard/descubrir', component: Descubrir, canActivate: [authGuard] },
    { path: 'dashboard/buscador', component: BuscadorAvanzado, canActivate: [authGuard] },
    { path: 'dashboard/mi-lista', component: MiLista, canActivate: [authGuard] },
    { path: 'dashboard/anime/:id', component: AnimeDetailPage, canActivate: [authGuard] }
];
