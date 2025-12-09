import { Component, OnInit } from '@angular/core';
import { signal } from '@angular/core';
import { computed } from '@angular/core';

interface Anime {
  mal_id: number;
  title: string;
  images: {
    jpg: {
      image_url: string;
      large_image_url: string;
    }
  };
  synopsis: string;
  score: number;
  genres: { name: string }[];
  year: number;
  status: string;
  episodes: number;
}

@Component({
  selector: 'app-descubrir',
  imports: [],
  templateUrl: './descubrir.html',
  styleUrl: './descubrir.css',
})
export class Descubrir implements OnInit {

  // --- STATE WITH SIGNALS ---
  // API Data
  currentAnime = signal<Anime | null>(null);
  nextAnime = signal<Anime | null>(null);
  favorites = signal<Anime[]>([]);

  // UI State
  isDragging = signal(false);
  startX = signal(0);
  currentX = signal(0);
  dragOffset = signal(0);

  // Modal State
  selectedAnime = signal<Anime | null>(null);

  constructor() { }

  ngOnInit() {
    this.initDeck();
  }

  // --- API LOGIC (Jikan) ---
  // Utilizamos fetch simple para evitar complejidades de módulos en archivo único
  async fetchRandomAnime(): Promise<Anime | null> {
    try {
      // Pequeño delay artificial para no saturar la API si el usuario hace swipe muy rápido
      await new Promise(resolve => setTimeout(resolve, 600));

      const response = await fetch('https://api.jikan.moe/v4/random/anime');
      if (!response.ok) throw new Error('API limit or error');

      const data = await response.json();
      return data.data as Anime;
    } catch (e) {
      console.error("Error fetching anime:", e);
      return null;
    }
  }

  async initDeck() {
    // Carga inicial: Cargar Current y Next
    const first = await this.fetchRandomAnime();
    if (first) this.currentAnime.set(first);

    const second = await this.fetchRandomAnime();
    if (second) this.nextAnime.set(second);
  }

  async advanceDeck() {
    // 1. Next se convierte en Current
    const next = this.nextAnime();
    this.currentAnime.set(next);

    // 2. Limpiamos Next temporalmente
    this.nextAnime.set(null);

    // 3. Reseteamos posiciones
    this.resetDragState();

    // 4. Buscamos un nuevo Next en segundo plano
    const newNext = await this.fetchRandomAnime();
    if (newNext) this.nextAnime.set(newNext);
  }

  // --- SWIPE LOGIC ---

  startDrag(event: MouseEvent | TouchEvent) {
    this.isDragging.set(true);
    const clientX = event instanceof MouseEvent ? event.clientX : event.touches[0].clientX;
    this.startX.set(clientX);
  }

  onDrag(event: MouseEvent | TouchEvent) {
    if (!this.isDragging()) return;

    const clientX = event instanceof MouseEvent ? event.clientX : event.touches[0].clientX;
    this.currentX.set(clientX);

    // Calculamos cuánto se ha movido desde el inicio
    this.dragOffset.set(this.currentX() - this.startX());
  }

  endDrag() {
    if (!this.isDragging()) return;

    const offset = this.dragOffset();
    const threshold = 100; // Píxeles necesarios para considerar acción

    if (offset > threshold) {
      this.handleSwipe('right');
    } else if (offset < -threshold) {
      this.handleSwipe('left');
    } else {
      // Volver al centro (resorte)
      this.dragOffset.set(0);
    }

    this.isDragging.set(false);
  }

  manualSwipe(direction: 'left' | 'right') {
    // Simula un swipe automático con botones
    const endValue = direction === 'right' ? 500 : -500;

    // Animación simple modificando el dragOffset
    // En una app real usaríamos Angular Animations, aquí usamos CSS transition hack via signals
    this.isDragging.set(true); // Engañar al sistema para aplicar transform
    this.dragOffset.set(endValue);

    setTimeout(() => {
      this.handleSwipe(direction);
      this.isDragging.set(false);
    }, 300);
  }

  handleSwipe(direction: 'left' | 'right') {
    const current = this.currentAnime();
    if (!current) return;

    if (direction === 'right') {
      // SAVE TO FAVORITES
      this.favorites.update(favs => [...favs, current]);
      console.log('Guardado en favoritos:', current.title);
    } else {
      // DISCARD
      console.log('Descartado:', current.title);
    }

    // Avanzar a la siguiente carta
    this.advanceDeck();
  }

  resetDragState() {
    this.isDragging.set(false);
    this.startX.set(0);
    this.currentX.set(0);
    this.dragOffset.set(0);
  }

  // --- COMPUTED STYLES (Para animaciones fluidas) ---

  cardTransform = computed(() => {
    const x = this.dragOffset();
    // Rotar ligeramente mientras se arrastra (max 30 grados)
    const rotate = (x / 20);

    // Si no estamos arrastrando y el offset es 0, transition suave. 
    // Si estamos arrastrando, sin transition para respuesta inmediata.
    const transitionStyle = this.isDragging() ? 'none' : 'transform 0.5s ease';

    // Si el offset es muy grande (swipe out), mantenemos la posición final visualmente antes del reset
    return `translateX(${x}px) rotate(${rotate}deg)`;
  });

  // Opacidad de los sellos
  likeOpacity = computed(() => {
    const x = this.dragOffset();
    return x > 0 ? Math.min(x / 100, 1) : 0;
  });

  nopeOpacity = computed(() => {
    const x = this.dragOffset();
    return x < 0 ? Math.min(Math.abs(x) / 100, 1) : 0;
  });


  // --- DETAILS MODAL ---
  openDetails(e: Event) {
    e.stopPropagation(); // Evitar que el click dispare drag
    this.selectedAnime.set(this.currentAnime());
  }

  closeDetails() {
    this.selectedAnime.set(null);
  }

}
