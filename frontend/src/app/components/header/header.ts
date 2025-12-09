import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-header',
  imports: [RouterLink],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {

  addActiveClass(event: any) {

    // Al link activo, le eliminamos la clase
    const links = document.querySelectorAll('.nav-link');
    links.forEach((link) => {
      link.classList.remove('active');
    });

    // Al link que se le dio click, le agregamos la clase
    event.target.classList.add('active');
  }

}
