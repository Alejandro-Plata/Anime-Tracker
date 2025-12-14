import { Episode } from "./episode";
import { Genre } from "./genre";
import { Studio } from "./studio";

export interface AnimeDetail {
    mal_id: number;
    title: string;
    title_japanese: string;
    image_url: string;
    large_image_url: string;
    score: number;
    rank: number;
    synopsis: string;
    background: string;
    status: string;
    episodes_count: number;
    duration: string;
    source: string;
    year: number;
    studios: Studio[];
    genres: Genre[];
    episodes_list: Episode[];
}