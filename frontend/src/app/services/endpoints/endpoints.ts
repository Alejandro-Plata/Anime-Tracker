import { Injectable } from '@angular/core';
import type { Anime } from '../../types/anime';
import { AnimeDetail } from '../../types/animeDetail';
import { Episode } from '../../types/episode';

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
        mal_id: anime.mal_id,
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
        mal_id: anime.mal_id,
        url: anime.url,
        image_url: anime.images.webp.image_url,
        title: anime.titles[0].title,
        score: anime.score,
      });
    }
    return animes;
  }

  async getEpisodesById(id: string): Promise<Episode[]> {
    const response = await fetch(`${this.urlBase}anime/${id}/episodes`);
    const data = await response.json();
    const episodesData = data.data;
    const episodes: Episode[] = [];
    for (const episodeId in episodesData) {
      const episode = episodesData[episodeId];
      episodes.push({
        id: episode.id,
        title: episode.title,
        url: episode.url,
      });
    }
    return episodes;
  }

  // Petición para obtener los animes por su id (Detalles y favoritos)
  async getAnimeById(id: string): Promise<AnimeDetail> {
    const animeResponse = await fetch(`${this.urlBase}anime/${id}/full`);
    const animeData = await animeResponse.json();
    const idAnime = animeData.data.mal_id;

    // Esperamos a que lleguen los episodios
    const episodeData = await this.getEpisodesById(idAnime);

    // Creamos la lista de episodios
    const episodeList: Episode[] = [];
    for (const episodeId in episodeData) {
      const episode = episodeData[episodeId];
      episodeList.push({
        id: episode.id,
        title: episode.title,
        url: episode.url,
      });
    }

    // Obtenemos la lista de anime (están dentro de data)
    const animeList = animeData.data;

    const anime: AnimeDetail = {
      mal_id: animeList.mal_id,
      title: animeList.titles[0].title,
      title_japanese: animeList.titles[1].title,
      image_url: animeList.images.webp.image_url,
      score: animeList.score,
      rank: animeList.rank,
      synopsis: animeList.synopsis,
      background: animeList.background,
      status: animeList.status,
      episodes_count: animeList.episodes,
      duration: animeList.duration,
      source: animeList.source,
      year: animeList.year,
      studios: animeList.studios,
      genres: animeList.genres,
      episodes_list: episodeList,
    };


    return anime;
  }


}
