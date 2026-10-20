import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { Endpoints } from './endpoints';

describe('Endpoints', () => {
  let service: Endpoints;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(Endpoints);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should encode search parameters and map anime results', async () => {
    const query = new URLSearchParams({ q: 'Frieren & Beyond' }).toString();
    const resultPromise = service.searchAnime(query, 2);
    const request = httpTestingController.expectOne(
      (request) => request.url === 'https://jikan.lucashdo.com/v1/anime'
        && request.params.get('q') === 'Frieren & Beyond'
        && request.params.get('page') === '2'
    );
    request.flush({
      data: [{
        malId: 1,
        url: 'https://example.com/anime/1',
        imageUrl: 'https://example.com/anime.webp',
        title: 'Frieren & Beyond',
        score: 9,
        rating: 'PG-13',
      }],
      meta: { pagination: { hasNextPage: true } },
    });

    const result = await resultPromise;
    expect(result).toEqual({
      animes: [{
        mal_id: 1,
        url: 'https://example.com/anime/1',
        image_url: 'https://example.com/anime.webp',
        title: 'Frieren & Beyond',
        score: 9,
        rating: 'PG-13',
      }],
      hasNextPage: true,
    });
  });

  it('should load the current season as a complete unpaginated list', async () => {
    const resultPromise = service.getAnimesSeason();
    httpTestingController.expectOne('https://jikan.lucashdo.com/v1/seasons/now')
      .flush({
        data: [{
          malId: 61987,
          title: 'Kusuriya no Hitorigoto 3rd Season',
          imageUrl: 'https://example.com/anime.jpg',
          score: 8.66,
        }],
        meta: { cached: true },
      });

    expect(await resultPromise).toEqual({
      animes: [{
        mal_id: 61987,
        url: 'https://myanimelist.net/anime/61987',
        image_url: 'https://example.com/anime.jpg',
        title: 'Kusuriya no Hitorigoto 3rd Season',
        score: 8.66,
        rating: 'No disponible',
      }],
      hasNextPage: false,
    });
  });

  it('should map recommended anime fields and upgrade thumbnail URLs', async () => {
    const resultPromise = service.getAnimesRecommended(1);
    const request = httpTestingController.expectOne(
      'https://jikan.lucashdo.com/v1/recommendations/anime?page=1'
    );
    request.flush({
      data: [{
        malId: 1,
        title: 'Cowboy Bebop',
        imageUrl: 'https://example.com/anime-1.webp',
        recommendedMalId: 2,
        recommendedTitle: 'Trigun',
        recommendedImageUrl: 'https://example.com/anime-2t.jpg',
        content: 'Recommended anime',
      }],
      meta: { pagination: { hasNextPage: true } },
    });

    expect(await resultPromise).toEqual({
      animes: [{
        mal_id: 2,
        url: 'https://myanimelist.net/anime/2',
        image_url: 'https://example.com/anime-2.jpg',
        title: 'Trigun',
        rating: 'No disponible',
      }],
      hasNextPage: true,
    });
  });

  it('should load full anime details without depending on the episodes endpoint', async () => {
    const resultPromise = service.getAnimeById('1');
    httpTestingController.expectOne('https://jikan.lucashdo.com/v1/anime/1/full')
      .flush({
        data: {
          malId: 1,
          title: 'Cowboy Bebop',
          titleJapanese: 'カウボーイビバップ',
          imageUrl: 'https://example.com/anime.jpg',
          images: { medium: 'https://example.com/medium.jpg', large: 'https://example.com/large.jpg' },
          score: 8.75,
          rank: 51,
          synopsis: 'A space western.',
          background: null,
          status: 'Finished Airing',
          episodes: 26,
          duration: '24 min. per ep.',
          source: 'Original',
          year: 1998,
          studios: [{ malId: 14, name: 'Sunrise' }],
          genres: [{ malId: 1, name: 'Action' }],
        },
      });
    expect(await resultPromise).toEqual({
      mal_id: 1,
      title: 'Cowboy Bebop',
      title_japanese: 'カウボーイビバップ',
      image_url: 'https://example.com/medium.jpg',
      large_image_url: 'https://example.com/large.jpg',
      score: 8.75,
      rank: 51,
      synopsis: 'A space western.',
      background: '',
      status: 'Finished Airing',
      episodes_count: 26,
      duration: '24 min. per ep.',
      source: 'Original',
      year: 1998,
      studios: [{ name: 'Sunrise' }],
      genres: [{ name: 'Action' }],
      episodes_list: [],
    });
  });

  it('should map numbered episodes from the separate episodes endpoint', async () => {
    const resultPromise = service.getEpisodesById('1');
    httpTestingController.expectOne('https://jikan.lucashdo.com/v1/anime/1/episodes?page=1')
      .flush({
        data: [{
          number: 1,
          title: 'Asteroid Blues',
          aired: 'Oct 24, 1998',
          url: 'https://example.com/episode/1',
        }],
        meta: { pagination: { page: 1, limit: 100, count: 1, total: null, hasNextPage: false } },
      });

    expect(await resultPromise).toEqual([{
      id: 1,
      title: 'Asteroid Blues',
      date: 'Oct 24, 1998',
      url: 'https://example.com/episode/1',
    }]);
  });

  it('should reject failed API responses instead of returning empty results', async () => {
    const resultPromise = service.getRandomAnime();
    httpTestingController.expectOne('https://jikan.lucashdo.com/v1/random/anime')
      .flush({
        error: {
          code: 'RATE_LIMITED',
          message: 'Too many requests.',
          requestId: 'request-123',
        },
      }, { status: 429, statusText: 'Too Many Requests' });

    await expectAsync(resultPromise).toBeRejectedWithError(
      'Too many requests. (referencia: request-123)'
    );
  });
});
