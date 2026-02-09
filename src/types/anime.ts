

export type AdminFilterItem = {
    id: number;
    title: string;
    visible?: boolean;
};

export type FiltersMap = Record<string, AdminFilterItem[]>;

export type FilterOption = {
    id: number;
    name: string;
};

export type FilterItem =
    | string
    | number
    | {
          id?: string | number;
          title?: string;
          label?: string;
          name?: string;
          value?: string | number;
      };

export interface Anime {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    featured_image: string;
    featured_image_url?: string | null;
    rating?: string | number | null;
    type?: string | null;
    status?: string | null;
    season_year?: number | null;
    season?: string | null;
    age_rating?: string | null;
    episodes?: number | null;
    episode_time?: number | null;
    studio?: { id: number; name: string; image?:string } | null;
    created_at?: string | null;
    updated_at?: string | null;
    filters?: { id: number; pivot?: { anime_id: number; filter_id: number } }[];
    filter_ids?: number[];
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
    type?: string[];
    availableFilters?: FiltersMap | Record<string, any>;
    filters?: FiltersMap | Record<string, any>;
    filtersList?: FiltersMap | null;
    studios?: FilterOption[];
    season?: FilterItem[];
    year?: FilterItem[];
}

export type EpisodeMediaItem = {
    id: number;
    type?: string | null;
    quality?: string | null;
    path?: string | null;
    url?: string | null;
    mime?: string | null;
    size?: number | null;
    duration?: number | null;
    language?: string | null;
    is_primary?: boolean;
};

export type EpisodeItem = {
    id: number;
    season_number?: number | null;
    episode_number?: number | null;
    title?: string | null;
    description?: string | null;
    duration?: number | null;
    air_date?: string | null;
    media?: EpisodeMediaItem[];
};

export interface AnimeDetailResponse {
    anime: Anime;
    episode_items?: EpisodeItem[];
}

export type AnimeFilterPreset = {
    id: number;
    name: string;
    filters: {
        sort?: string;
        type?: string[];
        filters?: string[];
        studios?: string[];
        age_rating?: string[];
    };
    created_at?: string | null;
    updated_at?: string | null;
};
