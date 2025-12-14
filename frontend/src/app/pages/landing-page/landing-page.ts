import { Component, inject, OnInit, signal } from '@angular/core';
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
  pagesSeason = 1;
  pagesRecommended = 1;

  hasMorePagesSearch = true;
  hasMorePagesSeason = true;
  hasMorePagesRecommended = true;


  onInputChange(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    const newValue = inputElement.value;

    this.searchQuery = newValue;


    if (newValue.trim().length === 0) {
      this.searchResults = [];
      return;
    }

    // Delay para evitar exceso de peticiones y que la api me banee
    setTimeout(() => {
      this.searchAnimes();
    }, 1000);

  }

  ngOnInit(): void {
    this.pagesSeason = 1;
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
    this.endpoints.getAnimesSeason(this.pagesSeason).then((animePage) => {
      this.topAnimesSeason = animePage.animes;
      this.hasMorePagesSeason = animePage.hasNextPage;
    });
  }


  loadInitialRecommended() {
    this.endpoints.getAnimesRecommended(this.pagesRecommended).then((animePage) => {
      this.recommendedAnimes = animePage.animes;
      this.hasMorePagesRecommended = animePage.hasNextPage;
    });
  }

  navigateToAnimeDetail(animeId: number) {
    this.router.navigate(['/anime', animeId]);
  }

  searchAnimes() {

    this.pagesSearch = 1;
    this.hasMorePagesSearch = true;
    this.endpoints.searchAnime(`q=${this.searchQuery}`, this.pagesSearch).then((animePage) => {

      this.searchResults = animePage.animes;
      this.hasMorePagesSearch = animePage.hasNextPage;
    });
  }

  loadMoreAnimes() {
    if (!this.hasMorePagesSearch) return;

    this.pagesSearch++;

    this.endpoints.searchAnime(this.searchQuery, this.pagesSearch).then((animePage) => {
      this.searchResults = [...this.searchResults, ...animePage.animes];
      this.hasMorePagesSearch = animePage.hasNextPage;
    })
  }

  loadMoreSeason() {
    if (!this.hasMorePagesSeason) return;

    this.pagesSeason++;
    this.endpoints.getAnimesSeason(this.pagesSeason).then((animePage) => {
      this.topAnimesSeason = [...this.topAnimesSeason, ...animePage.animes];
      this.hasMorePagesSeason = animePage.hasNextPage;
    })
  }

  loadMoreRecommended() {
    if (!this.hasMorePagesRecommended) return;

    this.pagesRecommended++;

    this.endpoints.getAnimesRecommended(this.pagesRecommended).then((animePage) => {
      this.recommendedAnimes = [...this.recommendedAnimes, ...animePage.animes];
      this.hasMorePagesRecommended = animePage.hasNextPage;
    })
  }


}
