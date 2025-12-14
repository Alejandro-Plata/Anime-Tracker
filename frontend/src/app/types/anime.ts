import { Genre } from "./genre";

export interface Anime {
    mal_id: number;
    url: string;
    image_url: string;
    title: string;
    score?: number;
    rating?: string;
    genre?: Genre[];
}