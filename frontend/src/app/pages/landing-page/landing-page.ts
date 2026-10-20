import { Component, inject, OnInit } from '@angular/core';
import { Endpoints } from '../../services/endpoints/endpoints';
import type { Anime } from '../../types/anime';
import { Router, RouterModule } from '@angular/router';
import { Card } from "../../components/card/card";

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [RouterModule, Card],
  templateUrl: './landing-page.html',
  styleUrl: './landing-page.css',
})
export class LandingPage implements OnInit {

  private endpoints = inject(Endpoints);
  private router = inject(Router);
  searchQuery = '';
  searchResults: Anime[] = [];
  topAnimesSeason: Anime[] = [];
  recommendedAnimes: Anime[] = [];

  pagesSearch = 1;
  pagesRecommended = 1;

  hasMorePagesSearch = true;
  hasMorePagesRecommended = true;

  isLoadingSearch = false;
  isLoadingSeason = true;
  isLoadingRecommended = true;
  isLoadingMoreSearch = false;
  isLoadingMoreRecommended = false;
  searchError = '';
  seasonError = '';
  recommendedError = '';

  private searchTimeout?: ReturnType<typeof setTimeout>;
  private searchRequestId = 0;
  private currentSearchQuery = '';

  onInputChange(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    const newValue = inputElement.value;

    this.searchQuery = newValue;
    clearTimeout(this.searchTimeout);
    this.searchRequestId++;

    if (newValue.trim().length === 0) {
      this.searchRequestId++;
      this.searchResults = [];
      this.searchError = '';
      this.isLoadingSearch = false;
      this.hasMorePagesSearch = false;
      this.hasMorePagesSearch = false;
      return;
    }

    // Delay para evitar exceso de peticiones y que la api me banee
    this.searchResults = [];
    this.searchError = '';
    this.hasMorePagesSearch = false;
    this.isLoadingSearch = true;
    this.searchTimeout = setTimeout(() => {
      void this.searchAnimes();
    }, 1000);

  }

  ngOnInit(): void {
    this.pagesRecommended = 1;
    this.pagesSearch = 1;
    this.topAnimesSeason = [];
    this.recommendedAnimes = [];
    this.searchResults = [];
    this.searchQuery = '';

    this.loadInitialSeason();
    this.loadInitialRecommended();
  }

  loadInitialSeason() {
    this.isLoadingSeason = true;
    this.seasonError = '';
    this.endpoints.getAnimesSeason().then((animePage) => {
      this.topAnimesSeason = animePage.animes;
    }).catch((error: unknown) => {
      console.error('Error cargando animes de temporada:', error);
      this.seasonError = 'No se pudieron cargar los animes de temporada.';
    }).finally(() => {
      this.isLoadingSeason = false;
    });
  }


  loadInitialRecommended() {
    this.isLoadingRecommended = true;
    this.recommendedError = '';
    this.endpoints.getAnimesRecommended(this.pagesRecommended).then((animePage) => {
      this.recommendedAnimes = animePage.animes;
      this.hasMorePagesRecommended = animePage.hasNextPage;
    }).catch((error: unknown) => {
      console.error('Error cargando recomendaciones:', error);
      this.recommendedError = 'No se pudieron cargar las recomendaciones.';
    }).finally(() => {
      this.isLoadingRecommended = false;
    });
  }

  navigateToAnimeDetail(animeId: number) {
    this.router.navigate(['/anime', animeId]);
  }

  async searchAnimes() {
    clearTimeout(this.searchTimeout);
    const query = this.searchQuery.trim();
    if (!query) {
      this.searchResults = [];
      this.isLoadingSearch = false;
      return;
    }
    const requestId = ++this.searchRequestId;
    this.currentSearchQuery = query;
    this.pagesSearch = 1;
    this.hasMorePagesSearch = false;
    this.searchError = '';
    this.isLoadingSearch = true;
    try {
      const animePage = await this.endpoints.searchAnime(
        new URLSearchParams({ q: query }).toString(),
        this.pagesSearch
      );
      if (requestId !== this.searchRequestId) return;
      this.searchResults = animePage.animes;
      this.hasMorePagesSearch = animePage.hasNextPage;
    } catch (error) {
      if (requestId !== this.searchRequestId) return;
      console.error('Error buscando anime:', error);
      this.searchError = 'No se pudo completar la búsqueda. Inténtalo de nuevo.';
      this.searchResults = [];
      this.hasMorePagesSearch = false;
    } finally {
      if (requestId === this.searchRequestId) this.isLoadingSearch = false;
    }
  }

  async loadMoreAnimes() {
    if (!this.hasMorePagesSearch || this.isLoadingMoreSearch) return;
    const requestId = this.searchRequestId;
    const nextPage = this.pagesSearch + 1;
    this.isLoadingMoreSearch = true;
    this.searchError = '';
    try {
      const animePage = await this.endpoints.searchAnime(
        new URLSearchParams({ q: this.currentSearchQuery }).toString(),
        nextPage
      );
      if (requestId !== this.searchRequestId) return;
      this.pagesSearch = nextPage;
      this.searchResults = [...this.searchResults, ...animePage.animes];
      this.hasMorePagesSearch = animePage.hasNextPage;
    } catch (error) {
      console.error('Error cargando más resultados:', error);
      this.searchError = 'No se pudieron cargar más resultados. Inténtalo de nuevo.';
    } finally {
      this.isLoadingMoreSearch = false;
    }
  }

  async loadMoreRecommended() {
    if (!this.hasMorePagesRecommended || this.isLoadingMoreRecommended) return;
    const nextPage = this.pagesRecommended + 1;
    this.isLoadingMoreRecommended = true;
    this.recommendedError = '';
    try {
      const animePage = await this.endpoints.getAnimesRecommended(nextPage);
      this.pagesRecommended = nextPage;
      this.recommendedAnimes = [...this.recommendedAnimes, ...animePage.animes];
      this.hasMorePagesRecommended = animePage.hasNextPage;
    } catch (error) {
      console.error('Error cargando más recomendaciones:', error);
      this.recommendedError = 'No se pudieron cargar más recomendaciones.';
    } finally {
      this.isLoadingMoreRecommended = false;
    }
  }


}
