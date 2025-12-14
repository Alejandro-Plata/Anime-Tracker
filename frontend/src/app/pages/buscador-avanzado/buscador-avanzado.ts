import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormBuilder } from '@angular/forms';
import { Endpoints } from '../../services/endpoints/endpoints';
import type { Anime } from '../../types/anime';
import { Router } from '@angular/router';
import { Card } from "../../components/card/card";
import { Loader } from "../../components/loader/loader";

@Component({
  selector: 'app-buscador-avanzado',
  standalone: true,
  imports: [ReactiveFormsModule, Card, Loader],
  templateUrl: './buscador-avanzado.html',
  styleUrl: './buscador-avanzado.css',
})
export class BuscadorAvanzado {

  searchForm: FormGroup;
  searchResults: Anime[] = [];

  // Paginación
  pages = 1;
  hasMorePages = true;

  // Guardamos la última query construida para usarla en "Cargar más"
  currentQuery: string = '';

  searchFlag = false;
  isLoading = false;

  private endpoints = inject(Endpoints);
  private router = inject(Router);

  constructor(private fb: FormBuilder) {
    this.searchForm = this.fb.group({
      query: [''],
      type: [''],
      status: [''],
      rating: [''],
      order_by: ['popularity'],
      score: [5], // El valor vive AQUÍ, dentro del grupo
      start_date: [''],
      end_date: [''],
      sort: ['desc'],
    });
  }

  get scoreValue(): number {
    return this.searchForm.get('score')?.value;
  }

  get queryValue(): string {
    return this.searchForm.get('query')?.value;
  }

  queryParts: string[] = [];

  onSubmit() {
    this.searchFlag = true;
    this.isLoading = true;
    this.pages = 1;
    this.searchResults = [];

    const f = this.searchForm.value;

    this.queryParts = [
      f.query ? `q=${f.query}` : '',
      f.type ? `type=${f.type}` : '',
      f.status ? `status=${f.status}` : '',
      f.rating ? `rating=${f.rating}` : '',
      f.order_by ? `order_by=${f.order_by}` : '',
      f.score ? `min_score=${f.score}` : '',
      f.start_date ? `start_date=${f.start_date}` : '',
      f.end_date ? `end_date=${f.end_date}` : '',
      f.sort ? `sort=${f.sort}` : '',
    ];

    this.currentQuery = this.queryParts.filter(part => part !== '').join('&');

    console.log(this.currentQuery);

    this.endpoints.searchAnime(this.currentQuery, this.pages).then((animePage) => {
      console.log(animePage.animes);
      this.searchResults = animePage.animes;
      this.hasMorePages = animePage.hasNextPage;
      this.isLoading = false;
    }).catch(err => {
      console.error("Error buscando anime:", err);
      this.searchResults = [];
      this.isLoading = false;
    });

  }

  loadMoreAnimes() {
    this.pages++;
    this.endpoints.searchAnime(this.currentQuery, this.pages).then((animePage) => {
      this.searchResults = [...this.searchResults, ...animePage.animes];
      this.hasMorePages = animePage.hasNextPage;
    });
  }

  navigateToAnimeDetail(animeId: number) {
    this.router.navigate(['/anime', animeId]);
  }
}