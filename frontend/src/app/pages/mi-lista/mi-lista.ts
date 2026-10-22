import { Component, OnInit } from '@angular/core';
import { inject } from '@angular/core';
import { AuthService } from '../../services/auth-service';
import { Favorite } from '../../types/user';
import { Endpoints } from '../../services/endpoints/endpoints';
import { Tab } from '../../types/tab';
import { FavoriteAnime } from '../../types/favoriteAnime';
import { Router, RouterLink } from '@angular/router';
import { Card } from '../../components/card/card';
import type { Anime } from '../../types/anime';

@Component({
  selector: 'app-mi-lista',
  imports: [RouterLink, Card],
  templateUrl: './mi-lista.html',
  styleUrl: './mi-lista.css',
})
export class MiLista implements OnInit {

  authService = inject(AuthService);
  endpoints = inject(Endpoints);
  activeTab: Tab = 'TODOS';
  favorites: Favorite[] = [];
  favoritesAnime: FavoriteAnime[] = [];
  favoritesShow: FavoriteAnime[] = [];
  router = inject(Router);

  async ngOnInit(): Promise<void> {
    this.setTab(this.activeTab);
    this.favorites = await this.authService.getFavorites();

    for (let i = 0; i < this.favorites.length; i++) {
      const favorite = this.favorites[i];

      try {
        const anime = await this.endpoints.getAnimeById(favorite.animeId.toString());
        this.favoritesAnime.push({ detalles: anime, state: favorite.state });

        this.setTab(this.activeTab);
      } catch (error) {
        console.error(`Error cargando anime ${favorite.animeId}:`, error);
      }

      if (i < this.favorites.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

  }

  setTab(tab: 'TODOS' | 'VIENDO' | 'FINALIZADO' | 'PENDIENTE' | 'ABANDONADO') {
    this.activeTab = tab;
    if (tab === 'TODOS') {
      this.favoritesShow = this.favoritesAnime;
    } else {
      this.favoritesShow = this.favoritesAnime.filter(favoriteAnime => favoriteAnime.state === tab);
    }
  }

  getCountByStatus(status: string): number {
    // Contamos sobre la lista completa para que los contadores no dependan de la pestaña activa
    return this.favoritesAnime.filter(favoriteAnime => favoriteAnime.state === status).length;
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'VIENDO':
        return 'Viendo';
      case 'FINALIZADO':
        return 'Finalizado';
      case 'PENDIENTE':
        return 'Pendiente';
      case 'ABANDONADO':
        return 'Abandonado';
    }
    return ''
  }

  // La tarjeta compartida recibe un Anime; la ficha completa ya trae todo lo necesario
  aAnime(favorite: FavoriteAnime): Anime {
    const d = favorite.detalles;
    return { mal_id: d.mal_id, url: `https://myanimelist.net/anime/${d.mal_id}`, image_url: d.image_url, title: d.title, score: d.score || undefined };
  }

  generos(favorite: FavoriteAnime): string[] {
    return favorite.detalles.genres.slice(0, 2).map(g => g.name);
  }

  navigateToAnimeDetail(animeId: number) {
    this.router.navigate(['dashboard', 'anime', animeId]);
  }

}
