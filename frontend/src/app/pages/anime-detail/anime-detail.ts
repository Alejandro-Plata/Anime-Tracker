import { Component, inject } from '@angular/core';
import { AnimeDetail } from '../../types/animeDetail';
import { Endpoints } from '../../services/endpoints/endpoints';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { State } from '../../types/state';
import { AuthService } from '../../services/auth-service';
import { Loader } from '../../components/loader/loader';
import { ToastState } from '../../types/toastState';
import { ToastType } from '../../types/toastType';
import { ClickOutside } from '../../directives/click-outside';

@Component({
  selector: 'app-anime-detail',
  imports: [FormsModule, Loader, ClickOutside],
  templateUrl: './anime-detail.html',
  styleUrl: './anime-detail.css',
})
export class AnimeDetailPage {

  route = inject(ActivatedRoute);
  endpoints = inject(Endpoints);
  authService = inject(AuthService);

  isFavorite: boolean = false;
  animeDetail: AnimeDetail | null = null;
  isLoading = true;
  errorMessage = '';
  isEpisodesLoading = false;
  episodesError = '';
  episodesSourceUrl = '';
  currentState: State = 'VIENDO';
  isSelectOpen: boolean = false;
  userScore: number = 0;
  isScoreSelectOpen: boolean = false;

  activeTab: 'episodes' | 'reviews' = 'episodes';
  toastState: ToastState = {
    show: false,
    type: 'like',
    title: '',
    message: ''
  };
  private toastTimeout: any;

  ngOnInit() {
    void this.loadAnimeDetail();
  }

  async loadAnimeDetail() {
    this.isLoading = true;
    this.errorMessage = '';
    try {
      const anime = await this.endpoints.getAnimeById(this.route.snapshot.params['id']);
      this.animeDetail = anime;
      this.episodesSourceUrl = `https://myanimelist.net/anime/${anime.mal_id}`;
      void this.loadEpisodes(anime.mal_id);
      this.authService.getIsFavorite(anime.mal_id).then((isFavorite) => {
        this.isFavorite = isFavorite;
      });
      this.authService.getFavoriteState(anime.mal_id).then((state) => {
        this.currentState = (state as State) || 'VIENDO';
      });
      this.authService.getFavoriteScore(anime.mal_id).then((score) => {
        this.userScore = score || 0;
      });
    } catch (error) {
      console.error('Error cargando el detalle del anime:', error);
      this.errorMessage = 'No se pudo cargar el anime. Comprueba la conexión e inténtalo de nuevo.';
    } finally {
      this.isLoading = false;
    }
  }

  async loadEpisodes(animeId = this.animeDetail?.mal_id) {
    if (!animeId || !this.animeDetail) return;
    this.isEpisodesLoading = true;
    this.episodesError = '';
    try {
      const episodes = await this.endpoints.getEpisodesById(String(animeId));
      this.animeDetail = { ...this.animeDetail, episodes_list: episodes };
    } catch (error) {
      console.error(`Error cargando episodios del anime ${animeId}:`, error);
      const detail = error instanceof Error ? error.message : 'Error desconocido.';
      this.episodesError = `No se pudieron cargar los episodios desde la API. ${detail}`;
    } finally {
      this.isEpisodesLoading = false;
    }
  }

  get studios() {

    const studios: string[] = [];

    if (this.animeDetail) {
      this.animeDetail.studios.forEach((studio) => {
        studios.push(studio.name);
      });
    }

    return studios.join(', ');
  }

  async toggleFavorite() {
    if (!this.animeDetail) return;

    // Esperamos la respuesta del servidor para no mostrar un estado que no se ha guardado
    try {
      if (this.isFavorite) {
        await this.authService.removeAnimeFromFavorites(this.animeDetail.mal_id);
        this.showToast('reject', 'Eliminado', 'Anime eliminado de favoritos.');
      } else {
        await this.authService.addAnimeToFavorites(this.animeDetail.mal_id);
        this.showToast('like', 'Favoritos', 'Anime añadido a favoritos.');
      }

      this.isFavorite = !this.isFavorite;
      // Al añadir o eliminar, el favorito vuelve a los valores por defecto del servidor
      this.currentState = 'VIENDO';
      this.userScore = 0;
    } catch (error) {
      console.error('Error al actualizar favoritos:', error);
      const message = error instanceof Error ? error.message : 'No se pudo actualizar favoritos';
      this.showToast('reject', 'Error', message);
    }
  }

  toggleSelect() {
    this.isSelectOpen = !this.isSelectOpen;
  }

  closeSelect() {
    this.isSelectOpen = false;
  }

  toggleScoreSelect() {
    this.isScoreSelectOpen = !this.isScoreSelectOpen;
  }

  closeScoreSelect() {
    this.isScoreSelectOpen = false;
  }

  async setState(state: State) {
    if (!this.animeDetail) return;
    const previousState = this.currentState;
    this.currentState = state;
    this.isSelectOpen = false;

    try {
      await this.authService.patchFavoriteState(this.animeDetail.mal_id, state);
      this.showToast('state', 'Estado', `Estado actualizado: ${state}`);
    } catch (error) {
      this.currentState = previousState;
      console.error('Error al guardar el estado:', error);
      const message = error instanceof Error ? error.message : 'No se pudo guardar el estado';
      this.showToast('reject', 'Error', message);
    }
  }

  setActiveTab(tab: 'episodes' | 'reviews') {
    this.activeTab = tab;
  }


  private showToast(type: ToastType, title: string, message: string) {
    if (this.toastTimeout) {
      clearTimeout(this.toastTimeout)
    }

    this.toastState = {
      show: true,
      type: type,
      title: title,
      message: message
    };

    this.toastTimeout = setTimeout(() => {
      this.toastState.show = false;
    }, 2500);
  }

  async setUserScore(score: number) {
    if (!this.animeDetail) return;
    const previousScore = this.userScore;
    this.userScore = score;
    this.isScoreSelectOpen = false;

    try {
      await this.authService.patchFavoriteScore(this.animeDetail.mal_id, score);
      this.showToast(
        'state',
        'Puntuación',
        score === 0 ? 'Nota eliminada.' : `Puntuación actualizada: ${score}`
      );
    } catch (error) {
      this.userScore = previousScore;
      console.error('Error al guardar puntuación:', error);
      const message = error instanceof Error ? error.message : 'No se pudo guardar la puntuación';
      this.showToast('reject', 'Error', message);
    }
  }
}
