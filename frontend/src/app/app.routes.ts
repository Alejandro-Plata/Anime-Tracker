import { Routes } from '@angular/router';
import { LandingPage } from './pages/landing-page/landing-page';
import { Descubrir } from './pages/descubrir/descubrir';
import { BuscadorAvanzado } from './pages/buscador-avanzado/buscador-avanzado';
import { MiLista } from './pages/mi-lista/mi-lista';
import { Login } from './pages/login/login';
import { Register } from './pages/register/register';
import { AnimeDetailPage } from './pages/anime-detail/anime-detail';

export const routes: Routes = [
    { path: '', component: Register },
    { path: 'register', component: Register },
    { path: 'login', component: Login },
    { path: 'dashboard', component: LandingPage },
    { path: 'dashboard/descubrir', component: Descubrir },
    { path: 'dashboard/buscador', component: BuscadorAvanzado },
    { path: 'dashboard/mi-lista', component: MiLista },
    { path: 'dashboard/anime/:id', component: AnimeDetailPage }
];
