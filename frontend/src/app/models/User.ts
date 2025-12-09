import { AnimeFav } from "./AnimesFav";

export interface User {
    user_id: string;
    username: string;
    favAnimes: AnimeFav[]
}