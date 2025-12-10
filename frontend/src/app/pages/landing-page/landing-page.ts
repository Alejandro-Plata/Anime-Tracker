import { Component, inject, OnInit, signal } from '@angular/core';
import { Endpoints } from '../../services/endpoints/endpoints';
import type { Anime } from '../../types/anime';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { AnimePage } from '../../types/animePage';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './landing-page.html',
  styleUrl: './landing-page.css',
})
export class LandingPage implements OnInit {

  // Inyectamos el servicio Endpoints
  private endpoints = inject(Endpoints);

  // Creamos el acceso a la ruta de detalles de un anime en concreto utilizando routerLink
  private router = inject(Router);

  // Definimos el estado como un Signal
  searchQuery = signal('');

  // Resultados de la búsqueda
  searchResults: Anime[] = [];

  // Animes de la temporada
  topAnimesSeason: Anime[] = [];

  // Animes recomendados
  recommendedAnimes: Anime[] = [];

  // Paginación
  pagesSearch = signal(1);
  pagesSeason = signal(1);
  pagesRecommended = signal(1);

  // Verificamos si hay más páginas para la búsqueda
  hasMorePagesSearch = signal(true);
  hasMorePagesSeason = signal(true);
  hasMorePagesRecommended = signal(true);

  // Control de concurrencia para evitar "parpadeos" o resultados antiguos
  private currentSearchId = 0;


  // Método para capturar el evento del input
  onInputChange(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    const newValue = inputElement.value;

    this.searchQuery.set(newValue);

    // Si borra el texto, limpiamos resultados y cancelamos búsquedas pendientes
    if (newValue.trim().length === 0) {
      this.currentSearchId++; // Invalidar peticiones anteriores
      this.searchResults = [];
      return;
    }

    this.searchAnimes();
  }

  ngOnInit(): void {
    this.loadInitialSeason();
    this.loadInitialRecommended();
  }

  // Carga inicial de los animes de temporada
  loadInitialSeason() {
    this.endpoints.getAnimesSeason(this.pagesSeason()).then((animePage) => {
      this.topAnimesSeason = animePage.animes;
      this.hasMorePagesSeason.set(animePage.hasNextPage);
    });
  }


  // Carga inicial de los animes recomendados por otros usuarios
  loadInitialRecommended() {
    this.endpoints.getAnimesRecommended(this.pagesRecommended()).then((animePage) => {
      // Simulamos un orden diferente para recomendaciones
      this.recommendedAnimes = animePage.animes;
      this.hasMorePagesRecommended.set(animePage.hasNextPage);
    });
  }

  // Función para navegar a la página de detalles de un anime
  navigateToAnimeDetail(animeId: number) {
    this.router.navigate(['/anime', animeId]);
  }

  // Función para buscar animes
  searchAnimes() {

    // Generamos un ID único para ESTA pulsación de tecla
    this.currentSearchId++;
    const myId = this.currentSearchId;

    // Cuando hacemos una nueva búsqueda, es necesario reiniciar la página a 1 y borrar los resultados anteriores
    this.pagesSearch.set(1);
    this.hasMorePagesSearch.set(true);
    // IMPORTANTE: Asegúrate de pasar la página 1 explícitamente si tu servicio lo requiere, o que el servicio use 1 por defecto.
    this.endpoints.searchAnime(this.searchQuery(), this.pagesSearch()).then((animePage) => {
      // Si el ID ya no es el último (el usuario siguió escribiendo),
      // ignoramos esta respuesta antigua para no sobrescribir la nueva.
      if (myId !== this.currentSearchId) return;

      this.searchResults = animePage.animes;
      this.hasMorePagesSearch.set(animePage.hasNextPage);
    });
  }

  loadMoreAnimes() {
    // Si la info del anime indica que no hay más páginas, no hacemos nada
    if (!this.hasMorePagesSearch()) return;

    this.pagesSearch.update(page => page + 1);

    this.endpoints.searchAnime(this.searchQuery(), this.pagesSearch()).then((animePage) => {
      this.searchResults = [...this.searchResults, ...animePage.animes];
      this.hasMorePagesSearch.set(animePage.hasNextPage);
    })
  }

  loadMoreSeason() {
    // Si la info del anime indica que no hay más páginas, no hacemos nada
    if (!this.hasMorePagesSeason()) return;

    this.pagesSeason.update(page => page + 1);
    this.endpoints.getAnimesSeason(this.pagesSeason()).then((animePage) => {
      this.topAnimesSeason = [...this.topAnimesSeason, ...animePage.animes];
      this.hasMorePagesSeason.set(animePage.hasNextPage);
    })
  }

  loadMoreRecommended() {
    // Si la info del anime indica que no hay más páginas, no hacemos nada
    if (!this.hasMorePagesRecommended()) return;

    this.pagesRecommended.update(page => page + 1);
    this.endpoints.getAnimesRecommended(this.pagesRecommended()).then((animePage) => {
      this.recommendedAnimes = [...this.recommendedAnimes, ...animePage.animes];
      this.hasMorePagesRecommended.set(animePage.hasNextPage);
    })
  }


}
