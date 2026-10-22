export interface User {
    id: string;
    username: string;
    email?: string;
    password: string;
}

export interface UserFavorites {
    id: string;
    username: string;
    favorites: Favorite[];
}

export interface Favorite {
    animeId: number;
    state: string;
    score: number;
}

export interface UserProfile {
    id: number;
    username: string;
    email: string;
    createdAt: string;
}
