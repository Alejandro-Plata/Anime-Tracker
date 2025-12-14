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

    for (let favorite of this.favorites) {
      // Medio segundo entre peticiones, para evitar baneo de la API
      setTimeout(() => {
        this.endpoints.getAnimeById(favorite.animeId.toString()).then(anime => {
          this.favoritesAnime.push({ detalles: anime, state: favorite.state });
        });
      }, 500);

    }
    console.log(this.favoritesAnime);
    console.log(this.favoritesShow);
    console.log(this.favorites);

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
