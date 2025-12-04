import { Routes } from '@angular/router';
import { LandingPage } from './pages/landing-page/landing-page';
import { Descubrir } from './pages/descubrir/descubrir';
import { BuscadorAvanzado } from './pages/buscador-avanzado/buscador-avanzado';
import { MiLista } from './pages/mi-lista/mi-lista';

export const routes: Routes = [
    { path: '', component: LandingPage },
    { path: 'descubrir', component: Descubrir },
    { path: 'buscador-avanzado', component: BuscadorAvanzado },
    { path: 'mi-lista', component: MiLista },
];
