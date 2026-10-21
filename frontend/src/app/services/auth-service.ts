import { Injectable } from '@angular/core';
import { User, UserFavorites } from '../types/user';
import { Favorite } from '../types/user';
@Injectable({
  providedIn: 'root',
})

export class AuthService {
  // En local usamos el backend en :3000; en cualquier otro dominio (Vercel) el backend desplegado.
  API_URL = ['localhost', '127.0.0.1'].includes(window.location.hostname)
    ? 'http://localhost:3000/api'
    : 'https://backend-anime-zeta.vercel.app/api';
  STORAGE_KEY = 'user';
  TOKEN_KEY = 'auth_token';
  async login(username: string, password: string): Promise<User> {
    const response = await fetch(`${this.API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    if (!response.ok) {
      throw new Error(await this.leerError(response, 'Error al iniciar sesión'));
    }
    const data = await response.json();
    if (data.token) {
      localStorage.setItem(this.TOKEN_KEY, data.token);
    }
    const token = localStorage.getItem(this.TOKEN_KEY);
    const userResponse = await fetch(`${this.API_URL}/auth/user`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    });
    if (!userResponse.ok) {
      throw new Error('Error al obtener datos del usuario');
    }
    const user: User = await userResponse.json();
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(user));
    return user;
  }
  async register(data: { username: string; email: string; password: string }): Promise<User> {
    const response = await fetch(`${this.API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(await this.leerError(response, 'Error al registrar'));
    }
    const responseData = await response.json();
    if (responseData.token) {
      localStorage.setItem(this.TOKEN_KEY, responseData.token);
    }
    const token = localStorage.getItem(this.TOKEN_KEY);
    const userResponse = await fetch(`${this.API_URL}/auth/user`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    });
    if (!userResponse.ok) {
      throw new Error('Error al obtener datos del usuario');
    }
    const user: User = await userResponse.json();
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(user));
    return user;
  }
  // Paso 1 de "olvidé mi contraseña": pide que se envíe un código al correo
  async forgotPassword(email: string): Promise<void> {
    const response = await fetch(`${this.API_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    if (!response.ok) {
      throw new Error(await this.leerError(response, 'No se pudo enviar el código'));
    }
  }

  // Paso 2: comprueba el código y guarda la nueva contraseña
  async resetPassword(email: string, code: string, password: string): Promise<void> {
    const response = await fetch(`${this.API_URL}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code, password }),
    });
    if (!response.ok) {
      throw new Error(await this.leerError(response, 'No se pudo cambiar la contraseña'));
    }
  }

  // El backend responde { error }, { msg }, { message } o, si falla la validación, { errors: [{ msg }] }.
  // Si el servidor devuelve otra cosa (una página HTML de error de Vercel, por ejemplo), response.json()
  // lanzaría un SyntaxError y el usuario vería "JSON.parse: unexpected character". Aquí lo evitamos.
  private async leerError(response: Response, porDefecto: string): Promise<string> {
    try {
      const data = await response.json();
      return data.error || data.msg || data.message || data.errors?.[0]?.msg || `${porDefecto} (error ${response.status})`;
    } catch {
      return `${porDefecto} (error ${response.status})`;
    }
  }

  async logout(): Promise<void> {
    try {
      const token = localStorage.getItem(this.TOKEN_KEY);
      await fetch(`${this.API_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });
    } catch (error) {
      console.log(error);
    } finally {
      localStorage.removeItem(this.STORAGE_KEY);
      localStorage.removeItem(this.TOKEN_KEY);
    }
  }
  isLoggedIn(): boolean {
    return !!localStorage.getItem(this.TOKEN_KEY);
  }
  getCurrentUser(): UserFavorites | null {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.log(error);
      localStorage.removeItem(this.STORAGE_KEY);
      return null;
    }
  }
  async refreshUser(): Promise<void> {
    try {
      const token = localStorage.getItem(this.TOKEN_KEY);
      const userResponse = await fetch(`${this.API_URL}/auth/user`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });
      if (userResponse.ok) {
        const user: User = await userResponse.json();
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(user));
      }
    } catch (error) {
      console.log(error);
    }
  }
  async getIsFavorite(animeId: number): Promise<boolean> {
    await this.refreshUser();
    const user = this.getCurrentUser();
    if (!user || !user.favorites) {
      return false;
    }
    return user.favorites.some(fav => fav.animeId === animeId);
  }
  async getFavoriteState(animeId: number): Promise<string | null> {
    await this.refreshUser();
    const user = this.getCurrentUser();
    if (!user || !user.favorites) {
      return null;
    }
    const favorite = user.favorites.find(fav => fav.animeId === animeId);
    return favorite ? favorite.state : null;
  }
  async getFavoriteScore(animeId: number): Promise<number | null> {
    await this.refreshUser();
    const user = this.getCurrentUser();
    if (!user || !user.favorites) {
      return null;
    }
    const favorite = user.favorites.find(fav => fav.animeId === animeId);
    return favorite ? favorite.score : null;
  }
  async getFavorites(): Promise<Favorite[]> {
    await this.refreshUser();
    const user = this.getCurrentUser();
    if (!user || !user.favorites) return [];
    return user.favorites;
  }
  async addAnimeToFavorites(animeId: number, state: string = 'VIENDO'): Promise<void> {
    const token = localStorage.getItem(this.TOKEN_KEY);
    const response = await fetch(`${this.API_URL}/user/favorites`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ animeId, state }),
    });
    if (!response.ok) {
      throw new Error(await this.leerError(response, 'Error al añadir a favoritos'));
    }
    await this.refreshUser();
  }
  async removeAnimeFromFavorites(animeId: number): Promise<void> {
    const token = localStorage.getItem(this.TOKEN_KEY);
    const response = await fetch(`${this.API_URL}/user/favorites/${animeId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    });
    if (!response.ok) {
      throw new Error(await this.leerError(response, 'Error al eliminar de favoritos'));
    }
    await this.refreshUser();
  }
  async patchFavoriteState(animeId: number, state: string): Promise<void> {
    const token = localStorage.getItem(this.TOKEN_KEY);
    const response = await fetch(`${this.API_URL}/user/favorites/${animeId}/state`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ state }),
    });
    if (!response.ok) {
      throw new Error(await this.leerError(response, 'Error en la petición'));
    }
    await this.refreshUser();
  }
  async patchFavoriteScore(animeId: number, score: number): Promise<void> {
    const token = localStorage.getItem(this.TOKEN_KEY);
    const response = await fetch(`${this.API_URL}/user/favorites/${animeId}/score`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ score }),
    });

    if (!response.ok) {
      throw new Error(await this.leerError(response, `Error ${response.status}`));
    }

    await this.refreshUser();
  }
}