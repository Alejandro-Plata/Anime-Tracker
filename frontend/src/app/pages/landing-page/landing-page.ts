import { Component, inject, OnInit } from '@angular/core';
import { Endpoints } from '../../services/endpoints/endpoints';
import type { Anime } from '../../types/anime';

@Component({
  selector: 'app-landing-page',
  imports: [],
  templateUrl: './landing-page.html',
  styleUrl: './landing-page.css',
})
export class LandingPage implements OnInit {

  // Inyectamos el servicio Endpoints
  private endpoints = inject(Endpoints);

  topAnimesSeason: Anime[] = [];

  ngOnInit(): void {
    this.endpoints.getAnimesSeason().then((animes) => {
      this.topAnimesSeason = animes.sort((a, b) => b.score - a.score); // Ordenamos los animes por score
    });
  }


}
