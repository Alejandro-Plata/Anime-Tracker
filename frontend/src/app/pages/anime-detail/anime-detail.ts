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

@Component({
  selector: 'app-anime-detail',
  imports: [FormsModule, Loader],
  templateUrl: './anime-detail.html',
  styleUrl: './anime-detail.css',
})
export class AnimeDetailPage {

  route = inject(ActivatedRoute);
  endpoints = inject(Endpoints);
  authService = inject(AuthService);

  isFavorite: boolean = false;
  animeDetail: AnimeDetail | null = null;
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
    this.endpoints.getAnimeById(this.route.snapshot.params['id']).then((anime) => {
      this.animeDetail = anime;
      this.authService.getIsFavorite(this.animeDetail.mal_id).then((isFavorite) => {
        this.isFavorite = isFavorite;
      });
      this.authService.getFavoriteState(this.animeDetail.mal_id).then((state) => {
        this.currentState = state as State;
      });
      this.authService.getFavoriteScore(this.animeDetail.mal_id).then((score) => {
        this.userScore = score || 0;
        console.log(score)
      });
    });

    console.log(this.userScore);

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

  toggleFavorite() {

    if (this.isFavorite) {
      this.authService.removeAnimeFromFavorites(this.animeDetail?.mal_id || 0);
      this.showToast('reject', 'Eliminado', 'Anime eliminado de favoritos.');
    } else {
      this.authService.addAnimeToFavorites(this.animeDetail?.mal_id || 0);
      this.showToast('like', 'Favoritos', 'Anime añadido a favoritos.');
    }

    this.isFavorite = !this.isFavorite;
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

  setState(state: State) {
    this.currentState = state;
    this.isSelectOpen = false;
    this.authService.patchFavoriteState(this.animeDetail?.mal_id || 0, state);
    this.showToast('state', 'Estado', `Estado actualizado: ${state}`);
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
    this.userScore = score;
    this.isScoreSelectOpen = false;

    try {
      this.showToast('state', 'Puntuacion', `Puntuacion actualizada: ${score}`);
      await this.authService.patchFavoriteScore(this.animeDetail?.mal_id || 0, score);
      console.log('Puntuación guardada:', this.userScore);
    } catch (error) {
      this.showToast('reject', 'Error', 'No se pudo guardar la puntuación');
    }
  }
}

