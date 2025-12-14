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
  anime!: Anime;

  ngOnInit(): void {
    this.endpoints.getRandomAnime().then((anime) => {
      this.anime = anime;
    });
  }

  toastState: ToastState = {
    show: false,
    type: 'like',
    title: '',
    message: ''
  };

  toastTimeout: any;

  changeAnime(action: string) {
    if (action === 'like') {
      this.showToast('like', 'Favoritos', 'Anime añadido a favoritos');
      this.authService.addAnimeToFavorites(this.anime.mal_id).then(() => {
        this.endpoints.getRandomAnime().then((anime) => {
          this.anime = anime;
        });
      });
    } else if (action === 'reject') {
      this.showToast('reject', 'Descartado', 'Anime descartado');
      this.endpoints.getRandomAnime().then((anime) => {
        this.anime = anime;
      });
    }
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
