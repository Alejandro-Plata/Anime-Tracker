import { Injectable } from '@angular/core';
import type { Anime } from '../../types/anime';

@Injectable({
  providedIn: 'root',
})
export class Endpoints {

  urlBase = 'https://api.jikan.moe/v4/';

  async getAnimesSeason(): Promise<Anime[]> {

    const animes: Anime[] = [];

    const response = await fetch(`${this.urlBase}seasons/now`);
    const data = await response.json();
    const animesData = data.data;

    // Recorremos todos los animes
    for (const animeId in animesData) {
      const anime = animesData[animeId]; // Obtenemos todo el objeto del anime
      animes.push({ // Nos quedamos solo con las propiedades que nos interesan
        url: anime.url,
        image_url: anime.images.webp.image_url,
        title: anime.titles[0].title,
        score: anime.score,
      });
    }

    return animes;
  }


  // Petición para obtener animes según lo que se introduzca en el buscador
  async getAnimeByName(name: string): Promise<Anime[]> {
    const response = await fetch(`${this.urlBase}anime?q={${name}}`);
    const data = await response.json();
    const animesData = data.data;
    const animes: Anime[] = [];
    for (const animeId in animesData) {
      const anime = animesData[animeId];
      animes.push({
        url: anime.url,
        image_url: anime.images.webp.image_url,
        title: anime.titles[0].title,
        score: anime.score,
      });
    }
    return animes;
  }


}
