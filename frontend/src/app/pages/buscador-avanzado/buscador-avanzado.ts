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
  isLoadingMore = false;
  errorMessage = '';

  private endpoints = inject(Endpoints);
  private router = inject(Router);

  constructor(private fb: FormBuilder) {
    this.searchForm = this.fb.group({
      query: [''],
      type: [''],
      status: [''],
      rating: [''],
      order_by: ['members'],
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

  onSubmit() {
    this.searchFlag = true;
    this.isLoading = true;
    this.pages = 1;
    this.searchResults = [];
    this.hasMorePages = false;
    this.errorMessage = '';

    const f = this.searchForm.value;
    const params = new URLSearchParams();
    if (f.query?.trim()) params.set('q', f.query.trim());
    if (f.type) params.set('type', f.type);
    if (f.status) params.set('status', f.status);
    if (f.rating) params.set('rating', f.rating);
    if (f.order_by) params.set('order_by', f.order_by);
    if (f.score) params.set('min_score', String(f.score));
    if (f.start_date) params.set('start_date', f.start_date);
    if (f.end_date) params.set('end_date', f.end_date);
    if (f.sort) params.set('sort', f.sort);
    this.currentQuery = params.toString();

    this.endpoints.searchAnime(this.currentQuery, this.pages).then((animePage) => {
      this.searchResults = animePage.animes;
      this.hasMorePages = animePage.hasNextPage;
    }).catch(err => {
      console.error("Error buscando anime:", err);
      this.searchResults = [];
      this.hasMorePages = false;
      this.errorMessage = 'No se pudo completar la búsqueda. Inténtalo de nuevo.';
    }).finally(() => {
      this.isLoading = false;
    });

  }

  async loadMoreAnimes() {
    if (!this.hasMorePages || this.isLoadingMore) return;
    const nextPage = this.pages + 1;
    this.isLoadingMore = true;
    this.errorMessage = '';
    try {
      const animePage = await this.endpoints.searchAnime(this.currentQuery, nextPage);
      this.pages = nextPage;
      this.searchResults = [...this.searchResults, ...animePage.animes];
      this.hasMorePages = animePage.hasNextPage;
    } catch (error) {
      console.error('Error cargando más resultados:', error);
      this.errorMessage = 'No se pudieron cargar más resultados. Inténtalo de nuevo.';
    } finally {
      this.isLoadingMore = false;
    }
  }

  navigateToAnimeDetail(animeId: number) {
    this.router.navigate(['/anime', animeId]);
  }
}