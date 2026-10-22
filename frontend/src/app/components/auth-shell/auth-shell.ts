import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Endpoints } from '../../services/endpoints/endpoints';
import type { Poster } from '../../types/poster';

// Marco común de inicio de sesión, registro y recuperación: panel de pósters a la izquierda
// (con la misma API que el resto de la app) y el formulario proyectado a la derecha.
@Component({
  selector: 'app-auth-shell',
  imports: [RouterLink],
  templateUrl: './auth-shell.html',
  styleUrl: './auth-shell.css',
})
export class AuthShell implements OnInit {
  private endpoints = inject(Endpoints);

  columnas = signal<Poster[][]>([]);

  ngOnInit() {
    this.endpoints.getPosters('top', 24).then(posters => {
      const cols: Poster[][] = [[], [], []];
      posters.slice(0, 18).forEach((p, i) => cols[i % 3].push(p));
      this.columnas.set(cols);
    }).catch(() => { /* sin pósters el panel sigue siendo un degradado válido */ });
  }

  imgError(event: Event, p: Poster) {
    const img = event.target as HTMLImageElement;
    if (p.fallback_url && img.src !== p.fallback_url) img.src = p.fallback_url;
  }
}
