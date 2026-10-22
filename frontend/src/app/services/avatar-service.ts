import { Injectable, inject, signal } from '@angular/core';
import { AuthService } from './auth-service';
import { Endpoints } from './endpoints/endpoints';
import type { Favorite } from '../types/user';

export const AVATAR_PLACEHOLDER =
  'https://m.media-amazon.com/images/I/61BK9ouh6bL._AC_UF1000,1000_QL80_.jpg';

// La imagen de perfil de cada usuario es el póster de su anime mejor puntuado.
// Sin ninguna nota puesta, o si el póster no se puede cargar, se usa la imagen por defecto.
@Injectable({ providedIn: 'root' })
export class AvatarService {
  private auth = inject(AuthService);
  private endpoints = inject(Endpoints);

  readonly url = signal(AVATAR_PLACEHOLDER);

  // Evita volver a pedir el póster mientras el anime elegido no cambie
  private currentAnimeId: number | null = null;
  private posters = new Map<number, string>();

  // Favorito con la nota más alta; si hay empate, el primero de la lista
  static best(favorites: Favorite[] | undefined): Favorite | null {
    let best: Favorite | null = null;
    for (const favorite of favorites ?? []) {
      if (favorite.score > 0 && (!best || favorite.score > best.score)) best = favorite;
    }
    return best;
  }

  async refresh(favorites: Favorite[] | undefined = this.auth.getCurrentUser()?.favorites): Promise<void> {
    const best = AvatarService.best(favorites);

    if (!best) {
      this.currentAnimeId = null;
      this.url.set(AVATAR_PLACEHOLDER);
      return;
    }
    if (best.animeId === this.currentAnimeId) return;
    this.currentAnimeId = best.animeId;

    const cached = this.posters.get(best.animeId);
    if (cached) {
      this.url.set(cached);
      return;
    }

    try {
      const anime = await this.endpoints.getAnimeById(String(best.animeId));
      const poster = anime.large_image_url || anime.image_url;
      // Si mientras tanto cambió el anime elegido, esta respuesta ya no vale
      if (this.currentAnimeId !== best.animeId) return;
      if (poster) {
        this.posters.set(best.animeId, poster);
        this.url.set(poster);
      }
    } catch {
      // Sin póster se queda la imagen por defecto; se reintentará en la próxima actualización
      if (this.currentAnimeId === best.animeId) this.currentAnimeId = null;
      this.url.set(AVATAR_PLACEHOLDER);
    }
  }

  // Al cerrar sesión no debe quedar la imagen del usuario anterior
  reset() {
    this.currentAnimeId = null;
    this.url.set(AVATAR_PLACEHOLDER);
  }
}
