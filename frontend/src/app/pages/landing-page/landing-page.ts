import { Component, inject, OnInit } from '@angular/core';
import { BusquedaEndpoint } from '../../services/endpoints/busqueda-endpoint';
import type { Anime } from '../../types/anime';

@Component({
  selector: 'app-landing-page',
  imports: [],
  templateUrl: './landing-page.html',
  styleUrl: './landing-page.css',
})
export class LandingPage implements OnInit {

  private busquedaEndpoint = inject(BusquedaEndpoint);

  ngOnInit(): void {
    this.busquedaEndpoint.getAnimesSeason().then((animes) => {
      console.log(animes);
    });
  }

}
