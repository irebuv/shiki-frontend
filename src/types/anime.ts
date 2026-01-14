

export interface Anime {
    id: number;
    name: string;
    description: string | null;
    featured_image: string;
}

export interface Pagination {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    next_page_url: string | null;
    prev_page_url: string | null;
    has_more: boolean;
}

export interface AnimeResponse {
    anime: Anime[];
    pagination: Pagination;
    types: string[];
    availableFilters:  Record<string, unknown>;
    filters:  Record<string, unknown>;
    filtersList:  Record<string, unknown>;
}
