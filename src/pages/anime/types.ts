export type AnimeFiltersState = {
    page: number;
    sort: string;
    type?: string[] | string;
    filters: string[] | string;
    studios?: string[] | string;
    age_rating?: string[] | string;
};

export type AnimeSetFilters = (values: Partial<AnimeFiltersState>) => void;
