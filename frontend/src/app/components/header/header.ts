import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth-service';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {

  isProfileMenuOpen = false;
  username: string = "";

  authService = inject(AuthService);
  router = inject(Router);

  ngOnInit() {
    this.username = this.authService.getCurrentUser()?.username || "";
  }

  toggleProfileMenu() {
    this.isProfileMenuOpen = !this.isProfileMenuOpen;
  }

  closeProfileMenu() {
    this.isProfileMenuOpen = false;
  }

  async logout() {
    this.isProfileMenuOpen = false;
    await this.authService.logout();
    this.router.navigate(['/login']);
  }



}
