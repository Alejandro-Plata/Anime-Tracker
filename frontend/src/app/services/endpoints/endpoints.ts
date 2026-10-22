import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom, TimeoutError, timeout } from 'rxjs';
import type { Anime } from '../../types/anime';
import type { AnimeDetail } from '../../types/animeDetail';
import type { Episode } from '../../types/episode';
import type { AnimePage } from '../../types/animePage';
import type { ReviewPage } from '../../types/review';
import type { Poster } from '../../types/poster';

interface ApiPagination {
  hasNextPage?: boolean;
}

interface ApiEnvelope<T> {
  data: T;
  meta?: {
    pagination?: ApiPagination;
  };
}

interface ApiAnime {
  malId: number;
  url?: string | null;
  title?: string | null;
  titleEnglish?: string | null;
  titleJapanese?: string | null;
  imageUrl?: string | null;
  images?: {
    small?: string | null;
    medium?: string | null;
    large?: string | null;
  } | null;
  score?: number | null;
  rating?: string | null;
  rank?: number | null;
  type?: string | null;
  synopsis?: string | null;
  background?: string | null;
  status?: string | null;
  episodes?: number | null;
  duration?: string | null;
  source?: string | null;
  year?: number | null;
  aired?: {
    from?: string | null;
  } | null;
  studios?: Array<{ malId?: number; name: string; url?: string }> | null;
  genres?: Array<{ malId?: number; name: string; url?: string }> | null;
}

interface ApiRecommendation {
  recommendedMalId: number;
  recommendedTitle: string;
  recommendedImageUrl?: string | null;
}

interface ApiEpisode {
  number: number;
  title: string;
  aired?: string | null;
  url: string;
}

interface ApiReview {
  reviewId: number;
  username: string;
  imageUrl?: string | null;
  date?: string | null;
  tag?: string | null;
  score?: number | null;
  reviewText?: string | null;
  isSpoiler?: boolean;
  url?: string | null;
  reactions?: { overall?: number | null } | null;
}

@Injectable({
  providedIn: 'root',
})
export class Endpoints {
  urlBase = 'https://jikan.lucashdo.com/v1/';
  private http = inject(HttpClient);
  // Las pantallas públicas comparten pósters; se piden una vez por visita
  private postersCache = new Map<'top' | 'season', Promise<Poster[]>>();

  private async request<T>(path: string): Promise<ApiEnvelope<T>> {
    try {
      return await firstValueFrom(
        this.http.get<ApiEnvelope<T>>(`${this.urlBase}${path}`).pipe(timeout({ first: 15_000 }))
      );
    } catch (error) {
      if (error instanceof TimeoutError) {
        throw new Error('La API de anime no respondió en 15 segundos. Comprueba la conexión e inténtalo de nuevo.');
      }
      if (error instanceof HttpErrorResponse) {
        const apiError = error.error?.error;
        const requestId = apiError?.requestId ? ` (referencia: ${apiError.requestId})` : '';
        const message = apiError?.message || `La API de anime respondió con el estado ${error.status}.`;
        throw new Error(`${message}${requestId}`);
      }
      throw error;
    }
  }

  private toAnime(anime: ApiAnime): Anime {
    return {
      mal_id: anime.malId,
      url: anime.url || `https://myanimelist.net/anime/${anime.malId}`,
      image_url: anime.imageUrl
        || anime.images?.medium
        || anime.images?.large
        || anime.images?.small
        || '',
      title: anime.title || anime.titleEnglish || 'Sin título',
      score: anime.score ?? undefined,
      rating: anime.rating || 'No disponible',
    };
  }

  // La API da la versión media (~225 px). La versión grande (sufijo "l", ~425 px) es la que aguanta
  // mostrarse a pantalla completa; image_url queda como respaldo si esa no existe.
  private toPoster(anime: ApiAnime): Poster {
    const medium = anime.images?.medium || anime.imageUrl || anime.images?.large || '';
    const large = anime.images?.large
      || medium.replace(/(\.(?:jpe?g|png|webp))(?:[?#].*)?$/i, 'l$1');
    return {
      mal_id: anime.malId,
      title: anime.title || anime.titleEnglish || 'Sin título',
      image_url: large,
      fallback_url: medium,
      score: anime.score ?? undefined,
      type: anime.type || undefined,
    };
  }

  getPosters(kind: 'top' | 'season', count = 24): Promise<Poster[]> {
    let cached = this.postersCache.get(kind);
    if (!cached) {
      cached = this.request<ApiAnime[]>(kind === 'top' ? 'top/anime' : 'seasons/now').then((response) => {
        if (!Array.isArray(response.data)) {
          throw new Error('La API de anime devolvió una lista inesperada.');
        }
        return response.data
          .filter((anime) => anime.imageUrl || anime.images?.medium)
          .slice(0, count)
          .map((anime) => this.toPoster(anime));
      });
      // Si falla no se queda guardado el error: el siguiente intento vuelve a pedirlo
      cached.catch(() => this.postersCache.delete(kind));
      this.postersCache.set(kind, cached);
    }
    return cached;
  }

  async searchPosters(query: string, count = 8): Promise<Poster[]> {
    const params = new URLSearchParams({ q: query, page: '1' });
    const response = await this.request<ApiAnime[]>(`anime?${params.toString()}`);
    if (!Array.isArray(response.data)) {
      throw new Error('La API de anime devolvió una lista inesperada.');
    }
    return response.data
      .filter((anime) => anime.imageUrl || anime.images?.medium)
      .slice(0, count)
      .map((anime) => this.toPoster(anime));
  }

  private toFullSizeImageUrl(imageUrl: string | null | undefined): string {
    return imageUrl?.replace(/t(?=\.(?:jpe?g|png|webp)(?:[?#]|$))/i, '') || '';
  }

  private toAnimePage(response: ApiEnvelope<ApiAnime[]>): AnimePage {
    if (!Array.isArray(response.data)) {
      throw new Error('La API de anime devolvió una lista inesperada.');
    }
    return {
      animes: response.data.map((anime) => this.toAnime(anime)),
      hasNextPage: response.meta?.pagination?.hasNextPage ?? false,
    };
  }

  async getAnimesSeason(): Promise<AnimePage> {
    return this.toAnimePage(await this.request<ApiAnime[]>('seasons/now'));
  }

  async getAnimeByName(name: string): Promise<AnimePage> {
    return this.searchAnime(new URLSearchParams({ q: name }).toString(), 1);
  }

  async getEpisodesById(id: string): Promise<Episode[]> {
    const response = await this.request<ApiEpisode[]>(
      `anime/${encodeURIComponent(id)}/episodes?page=1`
    );
    if (!Array.isArray(response.data)) {
      throw new Error('La API de anime devolvió una lista de episodios inesperada.');
    }
    return response.data.map((episode) => ({
      id: episode.number,
      date: episode.aired || '',
      title: episode.title,
      url: episode.url,
    }));
  }

  // La API devuelve las reseñas de 20 en 20; hasNextPage indica si hay otra página
  async getReviewsById(id: string, page = 1): Promise<ReviewPage> {
    const response = await this.request<ApiReview[]>(
      `anime/${encodeURIComponent(id)}/reviews?page=${page}`
    );
    if (!Array.isArray(response.data)) {
      throw new Error('La API de anime devolvió una lista de reseñas inesperada.');
    }
    return {
      reviews: response.data.map((review) => ({
        id: review.reviewId,
        username: review.username,
        avatarUrl: review.imageUrl || '',
        date: review.date || '',
        tag: review.tag || '',
        score: review.score ?? 0,
        text: this.decodeHtml(review.reviewText || ''),
        isSpoiler: !!review.isSpoiler,
        likes: review.reactions?.overall ?? 0,
        url: review.url || '',
      })),
      hasNextPage: response.meta?.pagination?.hasNextPage ?? false,
    };
  }

  // Los textos llegan con entidades HTML (&rsquo;, &amp;...). DOMParser las convierte a texto normal
  // sin ejecutar nada, y luego se muestran con {{ }}, que ya escapa cualquier etiqueta.
  private decodeHtml(text: string): string {
    return new DOMParser().parseFromString(text, 'text/html').documentElement.textContent || '';
  }

  async getAnimeById(id: string): Promise<AnimeDetail> {
    const response = await this.request<ApiAnime>(`anime/${encodeURIComponent(id)}/full`);
    const anime = response.data;
    if (!anime || typeof anime.malId !== 'number') {
      throw new Error('La API no devolvió el detalle del anime solicitado.');
    }

    const parsedYear = anime.aired?.from ? Number(anime.aired.from.slice(0, 4)) : 0;

    return {
      mal_id: anime.malId,
      title: anime.title || anime.titleEnglish || 'Sin título',
      title_japanese: anime.titleJapanese || '',
      image_url: anime.imageUrl || anime.images?.medium || anime.images?.small || '',
      large_image_url: anime.images?.large || anime.imageUrl || anime.images?.medium || '',
      score: anime.score ?? 0,
      rank: anime.rank ?? 0,
      synopsis: anime.synopsis || '',
      background: anime.background || '',
      status: anime.status || '',
      episodes_count: anime.episodes ?? 0,
      duration: anime.duration || '',
      source: anime.source || '',
      year: anime.year ?? parsedYear,
      studios: (anime.studios || []).map(({ name }) => ({ name })),
      genres: (anime.genres || []).map(({ name }) => ({ name })),
      episodes_list: [],
    };
  }

  async searchAnime(query: string, page: number): Promise<AnimePage> {
    const params = new URLSearchParams(query.includes('=') ? query : '');
    if (!query.includes('=')) {
      params.set('q', query);
    }
    params.set('page', String(page));
    return this.toAnimePage(
      await this.request<ApiAnime[]>(`anime?${params.toString()}`)
    );
  }

  async getAnimesRecommended(page: number): Promise<AnimePage> {
    const response = await this.request<ApiRecommendation[]>(
      `recommendations/anime?page=${page}`
    );
    if (!Array.isArray(response.data)) {
      throw new Error('La API de anime devolvió recomendaciones inesperadas.');
    }
    return {
      animes: response.data.map((recommendation) => ({
        mal_id: recommendation.recommendedMalId,
        url: `https://myanimelist.net/anime/${recommendation.recommendedMalId}`,
        image_url: this.toFullSizeImageUrl(recommendation.recommendedImageUrl),
        title: recommendation.recommendedTitle || 'Sin título',
        rating: 'No disponible',
      })),
      hasNextPage: response.meta?.pagination?.hasNextPage ?? false,
    };
  }

  async getRandomAnime(): Promise<Anime> {
    const response = await this.request<ApiAnime>('random/anime');
    if (!response.data || typeof response.data.malId !== 'number') {
      throw new Error('La API no devolvió un anime aleatorio.');
    }
    const anime = this.toAnime(response.data);
    return { ...anime, score: anime.score ?? 0 };
  }
}
