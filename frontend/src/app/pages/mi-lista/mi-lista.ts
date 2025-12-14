import { Component, OnInit } from '@angular/core';
import { inject } from '@angular/core';
import { AuthService } from '../../services/auth-service';
import { Favorite } from '../../types/user';
import { Endpoints } from '../../services/endpoints/endpoints';
import { Tab } from '../../types/tab';
import { FavoriteAnime } from '../../types/favoriteAnime';
import { Router } from '@angular/router';

@Component({
  selector: 'app-mi-lista',
  imports: [],
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

    // Cargar favoritos uno por uno con delay para evitar rate limiting
    for (let i = 0; i < this.favorites.length; i++) {
      const favorite = this.favorites[i];

      try {
        const anime = await this.endpoints.getAnimeById(favorite.animeId.toString());
        this.favoritesAnime.push({ detalles: anime, state: favorite.state });

        // Actualizar la vista después de cada carga
        this.setTab(this.activeTab);
      } catch (error) {
        console.error(`Error cargando anime ${favorite.animeId}:`, error);
      }

      // Esperar 1 segundo entre peticiones (evita 429 rate limit)
      // Jikan API permite 3 peticiones por segundo, pero getAnimeById hace 2 peticiones
      if (i < this.favorites.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    console.log('Favoritos cargados:', this.favoritesAnime);
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
    return this.favoritesShow.filter(favoriteAnime => favoriteAnime.state === status).length;
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

  navigateToAnimeDetail(animeId: number) {
    this.router.navigate(['dashboard', 'anime', animeId]);
  }

}
