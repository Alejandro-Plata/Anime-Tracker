import { Component, inject } from '@angular/core';
import { AnimeDetail } from '../../types/animeDetail';
import { Endpoints } from '../../services/endpoints/endpoints';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-anime-detail',
  imports: [],
  templateUrl: './anime-detail.html',
  styleUrl: './anime-detail.css',
})
export class AnimeDetailPage {

  // Declaramos el anime que vamos a mostrar
  animeDetail: AnimeDetail | null = null;

  // También tenemos que acceder al id del anime que viene por parámetro
  private route = inject(ActivatedRoute);

  // Inyectamos el servicio
  private endpoints = inject(Endpoints);

  constructor() { }

  ngOnInit() {
    this.endpoints.getAnimeById(this.route.snapshot.params['id']).then((anime) => {
      this.animeDetail = anime;
    });
  }

  // Extraer todos los estudios, separados por ","
  get studios() {

    const studios: string[] = [];

    // Añadimos todos los estudios al array si existe el anime
    if (this.animeDetail) {
      this.animeDetail.studios.forEach((studio) => {
        studios.push(studio.name);
      });
    }

    // Unimos todos los estudios con ", "
    return studios.join(', ');
  }

}
