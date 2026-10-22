import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from "@angular/router";
import { Endpoints } from "../../services/endpoints/endpoints";
import { Anime } from '../../types/anime';
import { Loader } from "../../components/loader/loader";
import { AuthService } from "../../services/auth-service";
import { ToastState } from '../../types/toastState';

@Component({
  selector: 'app-descubrir',
  imports: [RouterLink, Loader],
  templateUrl: './descubrir.html',
  styleUrl: './descubrir.css',
})
export class Descubrir implements OnInit {

  endpoints = inject(Endpoints);
  authService = inject(AuthService);
  anime: Anime | null = null;
  isLoading = true;
  errorMessage = '';

  ngOnInit(): void {
    void this.loadRandomAnime();
  }

  toastState: ToastState = {
    show: false,
    type: 'like',
    title: '',
    message: ''
  };

  toastTimeout: any;

  async changeAnime(action: 'like' | 'reject') {
    if (!this.anime || this.isLoading) return;

    if (action === 'like') {
      try {
        await this.authService.addAnimeToFavorites(this.anime.mal_id);
        this.showToast('like', 'Favoritos', 'Anime añadido a favoritos');
        await this.loadRandomAnime();
      } catch (error) {
        console.error('Error añadiendo anime a favoritos:', error);
        this.showToast('reject', 'Error', 'No se pudo añadir el anime a favoritos.');
      }
    } else if (action === 'reject') {
      this.showToast('reject', 'Descartado', 'Anime descartado');
      await this.loadRandomAnime();
    }
  }

  async loadRandomAnime() {
    this.isLoading = true;
    this.errorMessage = '';
    this.anime = null;
    try {
      this.anime = await this.endpoints.getRandomAnime();
    } catch (error) {
      console.error('Error cargando anime aleatorio:', error);
      this.errorMessage = 'No se pudo cargar un anime. Comprueba la conexión e inténtalo de nuevo.';
    } finally {
      this.isLoading = false;
    }
  }

  // El póster grande es el que aguanta mostrarse a este tamaño; si no existe se usa el medio
  largeSrc(url: string): string {
    return url.replace(/(\.(?:jpe?g|png|webp))(?:[?#].*)?$/i, 'l$1');
  }

  fallbackSrc(event: Event, url: string) {
    const img = event.target as HTMLImageElement;
    if (url && img.src !== url) img.src = url;
  }

  showToast(type: 'like' | 'reject', title: string, message: string) {
    if (this.toastTimeout) clearTimeout(this.toastTimeout);

    this.toastState = {
      show: true,
      type: type,
      title: title,
      message: message
    };

    this.toastTimeout = setTimeout(() => {
      this.toastState.show = false;
    }, 2000);
  }

}
