import { Component, Input, inject } from '@angular/core';
import { Anime } from '../../types/anime';
import { Router } from '@angular/router';

@Component({
  selector: 'app-card',
  imports: [],
  templateUrl: './card.html',
  styleUrl: './card.css',
})
export class Card {

  @Input() anime!: Anime;
  @Input() animeId!: number;

  private router = inject(Router);

  navigateToAnimeDetail() {
    this.router.navigate(['dashboard', 'anime', this.animeId]);
  }

}
