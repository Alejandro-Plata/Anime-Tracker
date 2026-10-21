export interface Review {
    id: number;
    username: string;
    avatarUrl: string;
    date: string;
    tag: string;
    score: number;
    text: string;
    isSpoiler: boolean;
    likes: number;
    url: string;
}

export interface ReviewPage {
    reviews: Review[];
    hasNextPage: boolean;
}
