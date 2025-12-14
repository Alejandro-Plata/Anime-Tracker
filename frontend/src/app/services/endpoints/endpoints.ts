import { Injectable } from '@angular/core';
import type { Anime } from '../../types/anime';
import { AnimeDetail } from '../../types/animeDetail';
import { Episode } from '../../types/episode';
import { AnimePage } from '../../types/animePage';

@Injectable({
  providedIn: 'root',
})
export class Endpoints {

  urlBase = 'https://api.jikan.moe/v4/';


  // Petición para obtener los animes de la temporada actual (paginados)
  async getAnimesSeason(page: number): Promise<AnimePage> {

    const animes: Anime[] = [];

    const response = await fetch(`${this.urlBase}seasons/now?page=${page}`);
    const data = await response.json();

    const animePage = data.pagination;
    const animesData = data.data;

    // Recorremos todos los animes
    for (const animeId in animesData) {
      const anime = animesData[animeId];
      animes.push({ // Nos quedamos solo con las propiedades que nos interesan
        mal_id: anime.mal_id,
        url: anime.url,
        image_url: anime.images.webp.image_url,
        title: anime.titles[0].title,
        score: anime.score,
        rating: anime.rating?.split(' - ')[1] || 'N/A',
      });
    }

    return {
      animes,
      hasNextPage: animePage.has_next_page,
    };
  }


  // Petición para obtener animes según lo que se introduzca en el buscador
  async getAnimeByName(name: string): Promise<AnimePage> {
    const response = await fetch(`${this.urlBase}anime?q={${name}}`);
    const data = await response.json();

    const animePage = data.pagination;
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
        rating: anime.rating?.split(' - ')[1] || 'N/A',
      });
    }
    return {
      animes,
      hasNextPage: animePage.has_next_page,
    };
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
        date: episode.aired,
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
        date: episode.date.split('T')[0],
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
      large_image_url: animeList.images.webp.large_image_url,
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

  // Petición para buscar animes
  async searchAnime(query: string, page: number): Promise<AnimePage> {
    const response = await fetch(`${this.urlBase}anime?${query}&page=${page}`);
    const data = await response.json();

    const animePage = data.pagination;
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
        rating: anime.rating?.split(' - ')[1] || 'N/A',
      });
    }
    return {
      animes,
      hasNextPage: animePage.has_next_page,
    };
  }

  // Petición para obtener animes recomendados 
  // Estos tienen la siguiente estructura --> Array (data) > Objeto (id y entry) - cada entry (array) > Objetos (animes) --> 2 array = 2 bucles
  async getAnimesRecommended(page: number): Promise<AnimePage> {

    const response = await fetch(`${this.urlBase}recommendations/anime?page=${page}`);
    const data = await response.json();

    const animePage = data.pagination;
    const animesData = data.data;

    const animes: Anime[] = [];

    for (const animeId in animesData) {
      const anime = animesData[animeId];

      for (const entryId in anime.entry) {
        const entry = anime.entry[entryId];

        animes.push({
          mal_id: entry.mal_id,
          url: entry.url,
          image_url: entry.images.webp.image_url,
          title: entry.title
        });
      }

    }
    return {
      animes,
      hasNextPage: animePage.has_next_page,
    };
  }

  // Petición para añadir a favoritos
  async addFavorite(animeId: number): Promise<void> {
    const response = await fetch(`${this.urlBase}anime/${animeId}/favorite`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error('Error al añadir a favoritos');
    }
  }

  async getRandomAnime(): Promise<Anime> {
    const response = await fetch(`${this.urlBase}random/anime`);
    const data = await response.json();
    const animeData = data.data;

    const anime: Anime = {
      mal_id: animeData.mal_id,
      url: animeData.url,
      image_url: animeData.images?.webp?.image_url || animeData.images?.jpg?.image_url || '',
      title: animeData.titles?.[0]?.title || animeData.title || 'Sin título',
      score: animeData.score || 0,
      rating: animeData.rating?.split(' - ')[1] || 'N/A'
    };

    return anime;
  }



}
