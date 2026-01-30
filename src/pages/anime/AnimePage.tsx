import MainLayout from '@/components/layout/MainLayout';
import { useQueryData } from '@/hooks/useQueryData';
import { AnimeResponse } from '@/types/anime';
import AnimeList from './component/AnimeList';
import { Pagination } from '@/components/custom/Pagination';
import AnimeFilters from './component/AnimeFilters';
import { ChosenFilters } from './component/filters/ChosenFilters';
import { AGE_RATING_OPTIONS } from '@/lib/ageRating';

export default function AnimePage() {
    const { data, filters, setFilters } = useQueryData<
        AnimeResponse,
        {
            page: number;
            sort: string;
            type?: string[];
            filters: string[] | string;
            studios?: string[] | string;
            age_rating?: string[] | string;
        }
    >({
        url: '/anime',
        initial: {
            page: 1,
            sort: 'updated_at:desc',
            type: undefined,
            filters: [],
            studios: [],
            age_rating: [],
        },
    });

    const availableFilters = data?.filtersList ?? data?.filters ?? data?.availableFilters;
    const activeFilters: string[] = Array.isArray(filters?.filters)
        ? filters.filters
        : filters?.filters
          ? String(filters.filters).split(',').filter(Boolean)
          : [];
    const activeStudios: string[] = Array.isArray(filters?.studios)
        ? filters.studios
        : filters?.studios
          ? String(filters.studios).split(',').filter(Boolean)
          : [];
    const activeTypes: string[] = Array.isArray(filters?.type)
        ? filters.type
        : filters?.type
          ? String(filters.type).split(',').filter(Boolean)
          : [];
    const activeAgeRate: string[] = Array.isArray(filters?.age_rating)
        ? filters.age_rating
        : filters?.age_rating
          ? String(filters.age_rating).split(',').filter(Boolean)
          : [];

    console.log('data-home', data, activeFilters);
    const filterTitleMap = new Map<string, string>();
    const filterGroupMap = new Map<string, string>();
    Object.entries(availableFilters ?? {}).forEach(([groupTitle, items]) => {
        (Array.isArray(items) ? items : []).forEach((item) => {
            if (typeof item === 'string' || typeof item === 'number') {
                filterTitleMap.set(String(item), String(item));
                filterGroupMap.set(String(item), groupTitle);
                return;
            }
            const id = item?.id ?? item?.value ?? item?.title ?? item?.name;
            const title = item?.title ?? item?.name ?? String(id ?? '');
            if (id !== undefined && id !== null) {
                filterTitleMap.set(String(id), String(title));
                filterGroupMap.set(String(id), groupTitle);
            }
        });
    });

    const studioTitleMap = new Map<string, string>();
    (data?.studios ?? []).forEach((studio) => {
        studioTitleMap.set(String(studio.id), studio.name);
    });

    const typeLabelMap: Record<string, string> = {
        tv: 'TV Series',
        tv_short: 'TV Short',
        tv_medium: 'TV Medium',
        tv_long: 'TV Long',
        movie: 'Movie',
        ova: 'OVA',
        ona: 'ONA',
    };

    const ageRatingMap = new Map<string, string>(
        AGE_RATING_OPTIONS.map((option) => [String(option.value), option.label]),
    );

    const removeFilter = (value: string) => {
        const next = activeFilters.filter((id) => id !== value);
        setFilters({ filters: next.length ? next : undefined });
    };

    const removeStudio = (value: string) => {
        const next = activeStudios.filter((id) => id !== value);
        setFilters({ studios: next.length ? next : undefined });
    };

    const removeType = (value: string) => {
        const next = activeTypes.filter((id) => id !== value);
        setFilters({ type: next.length ? next : undefined });
    };

    const removeAgeRate = (value: string) => {
        const next = activeAgeRate.filter((id) => id !== value);
        setFilters({age_rating: next.length ? next : undefined});
    };


    return (
        <div className="w-full mx-auto flex flex-col gap-5 px-7 mt-2">
            <div className={'grid grid-cols-5 gap-3'}>
                <AnimeFilters
                    filters={filters}
                    activeFilters={activeFilters}
                    availableFilters={availableFilters}
                    studios={data?.studios ?? []}
                    activeStudios={activeStudios}
                    activeAgeRating={activeAgeRate}
                    setFilters={setFilters}
                />
                <div className={'col-span-4 mt-3 justify-items-start"'}>
                    <div className={'mb-5 grid grid-cols-3 items-center justify-between'}>
                        <div>Home / Anime</div>
                        <h2 className={'mb-1 text-center text-2xl font-bold'}>Anime</h2>
                        <div className={`justify-self-end`}>
                            <Pagination
                                items={data?.pagination}
                                onPageChange={(page) => setFilters({ page })}
                            />
                        </div>
                    </div>
                    <ChosenFilters
                        activeTypes={activeTypes}
                        activeStudios={activeStudios}
                        activeFilters={activeFilters}
                        activeAgeRating={activeAgeRate}
                        typeLabelMap={typeLabelMap}
                        studioTitleMap={studioTitleMap}
                        filterTitleMap={filterTitleMap}
                        filterGroupMap={filterGroupMap}
                        ageRatingMap={ageRatingMap}
                        onRemoveAgeRate={removeAgeRate}
                        onRemoveType={removeType}
                        onRemoveStudio={removeStudio}
                        onRemoveFilter={removeFilter}
                        onClearAll={() =>
                            setFilters({
                                type: undefined,
                                studios: undefined,
                                filters: undefined,
                                age_rating: undefined,
                            })
                        }
                    />
                    <AnimeList data={data?.anime} />
                </div>
            </div>
        </div>
    );
}
