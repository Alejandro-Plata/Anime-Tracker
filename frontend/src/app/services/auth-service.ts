import { Injectable } from '@angular/core';
import { User, UserFavorites } from '../types/user';
import { Favorite } from '../types/user';
@Injectable({
  providedIn: 'root',
})

// API_URL real: 'https://backend-anime.vercel.app/api'
export class AuthService {
  API_URL = 'http://localhost:3000/api';
  STORAGE_KEY = 'user';
  TOKEN_KEY = 'auth_token';
  async login(username: string, password: string): Promise<User> {
    const response = await fetch(`${this.API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error al iniciar sesión');
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
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error al registrar');
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
      const errorData = await response.json();
      throw new Error(errorData.msg || 'Error al añadir a favoritos');
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
      const errorData = await response.json();
      throw new Error(errorData.msg || 'Error al eliminar de favoritos');
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
      const errorData = await response.json();
      throw new Error(errorData.msg);
    }
    await this.refreshUser();
  }
  async patchFavoriteScore(animeId: number, score: number): Promise<void> {
    const token = localStorage.getItem(this.TOKEN_KEY);

    console.log('Guardando puntuación:', {
      animeId,
      score,
      url: `${this.API_URL}/user/favorites/${animeId}/score`,
      hasToken: !!token
    });

    const response = await fetch(`${this.API_URL}/user/favorites/${animeId}/score`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ score }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error response:', errorData);
      throw new Error(errorData.msg || errorData.message || `Error ${response.status}`);
    }

    console.log('Puntuación guardada exitosamente');
    await this.refreshUser();
  }
}