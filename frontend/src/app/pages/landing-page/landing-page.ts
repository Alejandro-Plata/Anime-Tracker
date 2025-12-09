import { Component, inject, OnInit } from '@angular/core';
import { Endpoints } from '../../services/endpoints/endpoints';
import type { Anime } from '../../types/anime';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './landing-page.html',
  styleUrl: './landing-page.css',
})
export class LandingPage implements OnInit {

  // Inyectamos el servicio Endpoints
  private endpoints = inject(Endpoints);

  // Creamos el acceso a la ruta de detalles de un anime en concreto utilizando routerLink
  private router = inject(Router);

  topAnimesSeason: Anime[] = [];
  recommendedAnimes: Anime[] = [];

  ngOnInit(): void {
    // Obtener los animes de la temporada
    this.endpoints.getAnimesSeason().then((animes) => {
      this.topAnimesSeason = animes.sort((a, b) => b.score - a.score); // Ordenamos los animes por nota
    })
  }

  // Función para navegar a la página de detalles de un anime
  navigateToAnimeDetail(animeId: number) {
    this.router.navigate(['/anime-detail', animeId]);
  }

}
