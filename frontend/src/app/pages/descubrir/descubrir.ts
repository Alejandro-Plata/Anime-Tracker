import { Component, HostListener, OnInit, inject } from '@angular/core';
import { RouterLink } from "@angular/router";
import { Endpoints } from "../../services/endpoints/endpoints";
import { Anime } from '../../types/anime';
import { Loader } from "../../components/loader/loader";
import { AuthService } from "../../services/auth-service";
import { ToastState } from '../../types/toastState';

@Component({
  selector: 'app-descubrir',
  imports: [RouterLink, Loader],
  templateUrl: './descubrir.html',
  styleUrl: './descubrir.css',
})
export class Descubrir implements OnInit {

  endpoints = inject(Endpoints);
  authService = inject(AuthService);
  anime: Anime | null = null;
  isLoading = true;
  errorMessage = '';

  ngOnInit(): void {
    void this.loadRandomAnime();
  }

  toastState: ToastState = {
    show: false,
    type: 'like',
    title: '',
    message: ''
  };

  toastTimeout: any;
  // Cambia con cada aviso para que la animación de la notificación reinicie
  toastKey = 0;

  // --- Deslizar la tarjeta ---
  // Distancia en px (con signo) que lleva arrastrada la tarjeta; positiva = derecha
  dragX = 0;
  dragging = false;
  // Hacia dónde sale volando la tarjeta tras decidir
  flying: 'left' | 'right' | null = null;
  private startX = 0;
  // A partir de esta distancia, soltar cuenta como decisión
  private readonly threshold = 110;

  // Lo que se arrastra marca la intención: 0 a 1 según se acerca al umbral
  get likeStrength(): number {
    return Math.min(Math.max(this.dragX, 0) / this.threshold, 1);
  }

  get rejectStrength(): number {
    return Math.min(Math.max(-this.dragX, 0) / this.threshold, 1);
  }

  // Inclinación y desplazamiento de la tarjeta mientras se arrastra o sale volando
  get cardTransform(): string {
    if (this.flying) {
      const sign = this.flying === 'right' ? 1 : -1;
      return `translateX(${sign * 130}vw) rotate(${sign * 28}deg)`;
    }
    return `translateX(${this.dragX}px) rotate(${this.dragX / 18}deg)`;
  }

  onPointerDown(event: PointerEvent) {
    if (this.flying || this.isLoading) return;
    this.dragging = true;
    this.startX = event.clientX;
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
  }

  onPointerMove(event: PointerEvent) {
    if (!this.dragging) return;
    this.dragX = event.clientX - this.startX;
  }

  onPointerUp() {
    if (!this.dragging) return;
    this.dragging = false;
    // Si no llega al umbral, la tarjeta vuelve al centro
    if (this.dragX > this.threshold) this.swipe('right');
    else if (this.dragX < -this.threshold) this.swipe('left');
    else this.dragX = 0;
  }

  // Un clic sin arrastre abre la ficha; si se ha arrastrado, no
  onPosterClick(event: Event) {
    if (Math.abs(this.dragX) > 5 || this.flying) event.preventDefault();
  }

  // Derecha = me interesa, izquierda = descartar (también con los botones y las flechas)
  async swipe(direction: 'left' | 'right') {
    if (this.flying || this.isLoading || !this.anime) return;
    this.flying = direction;
    // Esperamos a que termine la animación de salida antes de cambiar de anime
    await new Promise(resolve => setTimeout(resolve, 320));
    await this.changeAnime(direction === 'right' ? 'like' : 'reject');
    this.flying = null;
    this.dragX = 0;
  }

  @HostListener('window:keydown', ['$event'])
  onKey(event: KeyboardEvent) {
    if (event.key === 'ArrowRight') void this.swipe('right');
    else if (event.key === 'ArrowLeft') void this.swipe('left');
  }

  async changeAnime(action: 'like' | 'reject') {
    if (!this.anime || this.isLoading) return;

    if (action === 'like') {
      try {
        await this.authService.addAnimeToFavorites(this.anime.mal_id);
        this.showToast('like', 'Favoritos', 'Anime añadido a favoritos');
        await this.loadRandomAnime();
      } catch (error) {
        console.error('Error añadiendo anime a favoritos:', error);
        this.showToast('reject', 'Error', 'No se pudo añadir el anime a favoritos.');
      }
    } else if (action === 'reject') {
      this.showToast('reject', 'Descartado', 'Anime descartado');
      await this.loadRandomAnime();
    }
  }

  async loadRandomAnime() {
    this.isLoading = true;
    this.errorMessage = '';
    this.anime = null;
    try {
      this.anime = await this.endpoints.getRandomAnime();
    } catch (error) {
      console.error('Error cargando anime aleatorio:', error);
      this.errorMessage = 'No se pudo cargar un anime. Comprueba la conexión e inténtalo de nuevo.';
    } finally {
      this.isLoading = false;
    }
  }

  // El póster grande es el que aguanta mostrarse a este tamaño; si no existe se usa el medio
  largeSrc(url: string): string {
    return url.replace(/(\.(?:jpe?g|png|webp))(?:[?#].*)?$/i, 'l$1');
  }

  fallbackSrc(event: Event, url: string) {
    const img = event.target as HTMLImageElement;
    if (url && img.src !== url) img.src = url;
  }

  showToast(type: 'like' | 'reject', title: string, message: string) {
    if (this.toastTimeout) clearTimeout(this.toastTimeout);

    this.toastKey++;
    this.toastState = {
      show: true,
      type: type,
      title: title,
      message: message
    };

    this.toastTimeout = setTimeout(() => {
      this.toastState.show = false;
    }, 2000);
  }

}
