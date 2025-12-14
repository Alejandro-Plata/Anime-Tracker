import { Component, signal, inject, ViewChild } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { Header } from "./components/header/header";
import { Footer } from "./components/footer/footer";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, Footer],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('animewatch-tracker');
  private router = inject(Router);

  isAuthPage(): boolean {
    const url = this.router.url;
    return url === '/' || url === '/login' || url === '/register';
  }
}
