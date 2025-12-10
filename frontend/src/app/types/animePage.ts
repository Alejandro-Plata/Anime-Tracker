import { Anime } from "./anime";

export interface AnimePage {
    animes: Anime[];
    hasNextPage: boolean;
}   