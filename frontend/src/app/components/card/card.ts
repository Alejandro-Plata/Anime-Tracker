import { Component, Input, inject } from '@angular/core';
import { Anime } from '../../types/anime';
import { Router } from '@angular/router';

const ESTADOS: Record<string, string> = {
  VIENDO: 'Viendo',
  FINALIZADO: 'Finalizado',
  PENDIENTE: 'Pendiente',
  ABANDONADO: 'Abandonado',
};

@Component({
  selector: 'app-card',
  imports: [],
  templateUrl: './card.html',
  styleUrl: './card.css',
})
export class Card {

  @Input() anime!: Anime;
  @Input() animeId!: number;
  // Estado en la lista del usuario y géneros: solo se pintan si llegan
  @Input() state?: string;
  @Input() genres: string[] = [];
  // En la landing la tarjeta es solo una muestra y no navega
  @Input() interactive = true;
  // Si ya es un póster grande, no hace falta pedir otra versión
  @Input() large = false;

  private router = inject(Router);

  get estadoLabel(): string {
    return this.state ? ESTADOS[this.state] ?? '' : '';
  }

  // La API da el póster medio (~225 px); el sufijo "l" es la versión grande, nítida a 2x
  get src(): string {
    const url = this.anime.image_url;
    return this.large ? url : url.replace(/(\.(?:jpe?g|png|webp))(?:[?#].*)?$/i, 'l$1');
  }

  imgError(event: Event) {
    const img = event.target as HTMLImageElement;
    if (this.anime.image_url && img.src !== this.anime.image_url) img.src = this.anime.image_url;
  }

  navigateToAnimeDetail() {
    if (!this.interactive) return;
    this.router.navigate(['dashboard', 'anime', this.animeId]);
  }

}
