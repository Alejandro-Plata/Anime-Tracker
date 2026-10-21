import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Endpoints } from '../../services/endpoints/endpoints';
import { AuthService } from '../../services/auth-service';
import { Anime } from '../../types/anime';

interface Poster {
  title: string;
  image_url: string;
  score: number;
  genres: string;
}

type Estado = 'VIENDO' | 'FINALIZADO' | 'PENDIENTE' | 'ABANDONADO';

// Pósters reales del top de MyAnimeList (datos de la API Jikan); sirven de material para la portada
// aunque la búsqueda en vivo no responda.
const POSTERS: Poster[] = [
  { title: 'Sousou no Frieren', image_url: 'https://cdn.myanimelist.net/images/anime/1015/138006.jpg', score: 9.24, genres: 'Aventura · Drama · Fantasía' },
  { title: 'Fullmetal Alchemist: Brotherhood', image_url: 'https://cdn.myanimelist.net/images/anime/1208/94745.jpg', score: 9.11, genres: 'Acción · Aventura · Fantasía' },
  { title: 'Steins;Gate', image_url: 'https://cdn.myanimelist.net/images/anime/1935/127974.jpg', score: 9.07, genres: 'Drama · Suspense · Ciencia ficción' },
  { title: 'Hunter x Hunter (2011)', image_url: 'https://cdn.myanimelist.net/images/anime/1337/99013.jpg', score: 9.03, genres: 'Acción · Aventura · Fantasía' },
  { title: 'Shingeki no Kyojin Season 3 Part 2', image_url: 'https://cdn.myanimelist.net/images/anime/1517/100633.jpg', score: 9.05, genres: 'Acción · Drama · Misterio' },
  { title: 'Steel Ball Run: JoJo no Kimyou na Bouken', image_url: 'https://cdn.myanimelist.net/images/anime/1065/158884.jpg', score: 9.04, genres: 'Acción · Aventura' },
  { title: 'Chainsaw Man Movie: Reze-hen', image_url: 'https://cdn.myanimelist.net/images/anime/1763/150638.jpg', score: 9.05, genres: 'Acción · Terror' },
  { title: 'Re:Zero kara Hajimeru Isekai Seikatsu 4th Season', image_url: 'https://cdn.myanimelist.net/images/anime/1540/155824.jpg', score: 9.08, genres: 'Drama · Fantasía · Suspense' },
];

@Component({
  selector: 'app-home',
  imports: [RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit, AfterViewInit, OnDestroy {
  private endpoints = inject(Endpoints);
  private host = inject<ElementRef<HTMLElement>>(ElementRef);
  authService = inject(AuthService);

  posters = POSTERS;
  estados: { id: Estado; label: string }[] = [
    { id: 'VIENDO', label: 'Viendo' },
    { id: 'FINALIZADO', label: 'Finalizado' },
    { id: 'PENDIENTE', label: 'Pendiente' },
    { id: 'ABANDONADO', label: 'Abandonado' },
  ];
  notas = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  // El monumento: la "I" de KAIRO es un póster que va cambiando
  indice = signal(0);

  // Demostración en vivo de la lista personal
  query = signal('');
  resultados = signal<Poster[]>([]);
  buscando = signal(false);
  errorBusqueda = signal('');
  seleccionado = signal<Poster>(POSTERS[0]);
  estado = signal<Estado>('VIENDO');
  nota = signal(9);

  private timer?: ReturnType<typeof setInterval>;
  private debounce?: ReturnType<typeof setTimeout>;
  private observer?: IntersectionObserver;

  ngOnInit() {
    const reducido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!reducido) {
      this.timer = setInterval(() => this.indice.update(i => (i + 1) % POSTERS.length), 2600);
    }
  }

  ngAfterViewInit() {
    const root = this.host.nativeElement;
    const elementos = Array.from(root.querySelectorAll<HTMLElement>('[data-reveal]'));
    if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }
    root.classList.add('reveal-ready');
    this.observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          this.observer?.unobserve(entry.target);
        }
      }
    }, { threshold: 0.15 });
    elementos.forEach(el => this.observer!.observe(el));
  }

  ngOnDestroy() {
    clearInterval(this.timer);
    clearTimeout(this.debounce);
    this.observer?.disconnect();
  }

  onBuscar(event: Event) {
    const valor = (event.target as HTMLInputElement).value;
    this.query.set(valor);
    clearTimeout(this.debounce);
    if (valor.trim().length < 2) {
      this.resultados.set([]);
      this.errorBusqueda.set('');
      return;
    }
    this.debounce = setTimeout(() => this.buscar(valor.trim()), 450);
  }

  private async buscar(texto: string) {
    this.buscando.set(true);
    this.errorBusqueda.set('');
    try {
      const pagina = await this.endpoints.searchAnime(texto, 1);
      this.resultados.set(pagina.animes.slice(0, 5).map(a => this.aPoster(a)));
      if (pagina.animes.length === 0) {
        this.errorBusqueda.set('Sin resultados para esa búsqueda.');
      }
    } catch {
      this.resultados.set([]);
      this.errorBusqueda.set('La búsqueda no respondió. Prueba otra vez en unos segundos.');
    } finally {
      this.buscando.set(false);
    }
  }

  private aPoster(a: Anime): Poster {
    return {
      title: a.title,
      image_url: a.image_url,
      score: a.score ?? 0,
      genres: (a.genre ?? []).map(g => g.name).slice(0, 3).join(' · '),
    };
  }

  etiqueta() {
    return this.estados.find(e => e.id === this.estado())?.label ?? '';
  }

  scrollTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  elegir(p: Poster) {
    this.seleccionado.set(p);
    this.resultados.set([]);
    this.query.set('');
  }
}
