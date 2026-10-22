import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Endpoints } from '../../services/endpoints/endpoints';
import { AuthService } from '../../services/auth-service';
import type { Poster } from '../../types/poster';

type Estado = 'TODOS' | 'VIENDO' | 'FINALIZADO' | 'PENDIENTE' | 'ABANDONADO';

interface Entrada {
  poster: Poster;
  estado: Exclude<Estado, 'TODOS'>;
  nota: number;
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
  imports: [RouterLink],
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

  // Mockup de "Mi lista"
  filtro = signal<Estado>('TODOS');
  query = signal('');
  resultados = signal<Poster[]>([]);
  buscando = signal(false);
  errorBusqueda = signal('');
  notaDemo = signal(9);

  entradas = computed<Entrada[]>(() =>
    this.top().slice(0, 12).map((poster, i) => ({
      poster,
      estado: REPARTO[i % REPARTO.length],
      nota: Math.max(6, Math.min(10, Math.round(poster.score ?? 8))),
    }))
  );
  visibles = computed(() => {
    const f = this.filtro();
    return this.entradas().filter(e => f === 'TODOS' || e.estado === f).slice(0, 8);
  });
  fondo = computed(() => this.top().slice(0, 12));
  destacado = computed(() => this.top()[0]);

  private debounce?: ReturnType<typeof setTimeout>;
  private peticion = 0;

  ngOnInit() {
    this.cargar();
  }

  ngOnDestroy() {
    clearTimeout(this.debounce);
  }

  cargar() {
    this.cargando.set(true);
    this.fallo.set(false);
    Promise.allSettled([
      this.endpoints.getPosters('top', 24),
      this.endpoints.getPosters('season', 18),
    ]).then(([top, season]) => {
      if (top.status === 'fulfilled') this.top.set(top.value);
      if (season.status === 'fulfilled') this.temporada.set(season.value);
      this.fallo.set(top.status === 'rejected' && season.status === 'rejected');
    }).finally(() => this.cargando.set(false));
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

  onBuscar(event: Event) {
    const valor = (event.target as HTMLInputElement).value;
    this.query.set(valor);
    clearTimeout(this.debounce);
    const id = ++this.peticion;
    if (valor.trim().length < 2) {
      this.resultados.set([]);
      this.errorBusqueda.set('');
      this.buscando.set(false);
      return;
    }
    this.buscando.set(true);
    this.debounce = setTimeout(() => this.buscar(valor.trim(), id), 500);
  }

  private async buscar(texto: string, id: number) {
    this.errorBusqueda.set('');
    try {
      const encontrados = await this.endpoints.searchPosters(texto, 8);
      if (id !== this.peticion) return;
      this.resultados.set(encontrados);
      if (encontrados.length === 0) this.errorBusqueda.set('Sin resultados para esa búsqueda.');
    } catch {
      if (id !== this.peticion) return;
      this.resultados.set([]);
      this.errorBusqueda.set('La búsqueda no respondió. Prueba otra vez en unos segundos.');
    } finally {
      if (id === this.peticion) this.buscando.set(false);
    }
  }

  scrollTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
