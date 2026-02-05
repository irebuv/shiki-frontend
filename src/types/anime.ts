

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
    season_year?: number | null;
    season?: string | null;
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
