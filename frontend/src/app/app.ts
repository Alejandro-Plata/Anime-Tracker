import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LandingPage } from "./pages/landing-page/landing-page";
import { Header } from "./components/header/header";
import { Footer } from "./components/footer/footer";
import { BuscadorAvanzado } from "./pages/buscador-avanzado/buscador-avanzado";
import { MiLista } from "./pages/mi-lista/mi-lista";
import { Descubrir } from "./pages/descubrir/descubrir";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, LandingPage, Header, Footer, BuscadorAvanzado, MiLista, Descubrir],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('animewatch-tracker');
}
