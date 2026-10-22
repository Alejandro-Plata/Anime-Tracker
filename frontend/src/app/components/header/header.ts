import { Component, OnInit, inject } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth-service';
import { ClickOutside } from '../../directives/click-outside';
import { AvatarService } from '../../services/avatar-service';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive, ClickOutside],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header implements OnInit {

  isProfileMenuOpen = false;
  isMenuOpen = false;

  authService = inject(AuthService);
  avatar = inject(AvatarService);
  router = inject(Router);

  ngOnInit() {
    void this.avatar.refresh();
    // El menú móvil se cierra al navegar
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        // Las notas pueden haber cambiado al navegar (p. ej. tras puntuar un anime)
        void this.avatar.refresh();
        this.isMenuOpen = false;
        this.isProfileMenuOpen = false;
      }
    });
  }

  // Se lee siempre del almacenamiento: si cambia el nombre en Mi perfil, la cabecera lo refleja al momento
  get username(): string {
    return this.authService.getCurrentUser()?.username || '';
  }

  get initial(): string {
    return (this.username.charAt(0) || '?').toUpperCase();
  }

  toggleProfileMenu() {
    this.isProfileMenuOpen = !this.isProfileMenuOpen;
  }

  closeProfileMenu() {
    this.isProfileMenuOpen = false;
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  async logout() {
    this.isProfileMenuOpen = false;
    await this.authService.logout();
    this.avatar.reset();
    this.router.navigate(['/login']);
  }

}
