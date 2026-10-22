import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Endpoints } from '../../services/endpoints/endpoints';
import { AuthService } from '../../services/auth-service';
import { Card } from '../../components/card/card';
import type { Anime } from '../../types/anime';
import type { Poster } from '../../types/poster';

type Estado = 'TODOS' | 'VIENDO' | 'FINALIZADO' | 'PENDIENTE' | 'ABANDONADO';

interface Entrada {
  anime: Anime;
  estado: Exclude<Estado, 'TODOS'>;
}

const ESTADOS: { id: Estado; label: string }[] = [
  { id: 'TODOS', label: 'Todos' },
  { id: 'VIENDO', label: 'Viendo' },
  { id: 'FINALIZADO', label: 'Finalizado' },
  { id: 'PENDIENTE', label: 'Pendiente' },
  { id: 'ABANDONADO', label: 'Abandonado' },
];

// Reparto fijo de estados para que la lista de ejemplo tenga de todo
const REPARTO: Exclude<Estado, 'TODOS'>[] = [
  'VIENDO', 'FINALIZADO', 'FINALIZADO', 'PENDIENTE', 'VIENDO', 'FINALIZADO', 'ABANDONADO', 'PENDIENTE',
  'FINALIZADO', 'VIENDO', 'PENDIENTE', 'FINALIZADO',
];

@Component({
  selector: 'app-home',
  imports: [RouterLink, Card],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit, OnDestroy {
  private endpoints = inject(Endpoints);
  authService = inject(AuthService);

  estados = ESTADOS;
  notas = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  top = signal<Poster[]>([]);
  temporada = signal<Poster[]>([]);
  cargando = signal(true);
  fallo = signal(false);

  // Réplica de "Mi lista"
  filtro = signal<Estado>('TODOS');
  generos = signal<Record<number, string[]>>({});

  entradas = computed<Entrada[]>(() =>
    this.top().slice(0, 12).map((poster, i) => ({
      anime: this.aAnime(poster),
      estado: REPARTO[i % REPARTO.length],
    }))
  );
  visibles = computed(() => {
    const f = this.filtro();
    return this.entradas().filter(e => f === 'TODOS' || e.estado === f).slice(0, 8);
  });
  fondo = computed(() => this.top().slice(0, 12));
  temporadaAnimes = computed(() => this.temporada().slice(0, 12).map(p => this.aAnime(p)));
  notaDemo = signal(9);

  private vivo = true;

  ngOnInit() {
    this.cargar();
  }

  ngOnDestroy() {
    this.vivo = false;
  }

  cargar() {
    this.cargando.set(true);
    this.fallo.set(false);
    Promise.allSettled([
      this.endpoints.getPosters('top', 24),
      this.endpoints.getPosters('season', 18),
    ]).then(([top, season]) => {
      if (top.status === 'fulfilled') {
        this.top.set(top.value);
        void this.cargarGeneros(top.value.slice(0, 12));
      }
      if (season.status === 'fulfilled') this.temporada.set(season.value);
      this.fallo.set(top.status === 'rejected' && season.status === 'rejected');
    }).finally(() => this.cargando.set(false));
  }

  // Como en la app real, los géneros salen de la ficha de cada serie; se piden despacio para no saturar la API
  private async cargarGeneros(posters: Poster[]) {
    for (const p of posters) {
      if (!this.vivo) return;
      try {
        const detalle = await this.endpoints.getAnimeById(String(p.mal_id));
        this.generos.update(g => ({ ...g, [p.mal_id]: detalle.genres.slice(0, 2).map(x => x.name) }));
      } catch { /* sin géneros la tarjeta sigue siendo válida */ }
      await new Promise(r => setTimeout(r, 400));
    }
  }

  // La tarjeta compartida pide la versión grande a partir de la media
  private aAnime(p: Poster): Anime {
    return { mal_id: p.mal_id, url: `https://myanimelist.net/anime/${p.mal_id}`, image_url: p.fallback_url, title: p.title, score: p.score };
  }

  cuenta(id: Estado): number {
    return id === 'TODOS'
      ? this.entradas().length
      : this.entradas().filter(e => e.estado === id).length;
  }

  etiqueta(id: string): string {
    return ESTADOS.find(e => e.id === id)?.label ?? '';
  }

  // Si el póster grande no existe en el CDN, se cae al tamaño medio
  imgError(event: Event, p: Poster) {
    const img = event.target as HTMLImageElement;
    if (p.fallback_url && img.src !== p.fallback_url) img.src = p.fallback_url;
  }

  scrollTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
