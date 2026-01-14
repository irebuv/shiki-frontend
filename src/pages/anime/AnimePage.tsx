import MainLayout from '@/components/layout/MainLayout';
import { useQueryData } from '@/hooks/useQueryData';
import { AnimeResponse } from '@/types/anime';
import AnimeList from './component/AnimeList';
import { Pagination } from '@/components/custom/Pagination';
import AnimeFilters from './component/AnimeFilters';

export default function AnimePage() {
    const { data, filters, setFilters } = useQueryData<
        AnimeResponse,
        { page: number; sort: string; type: string; filters: string[] | string }
    >({
        url: '/anime',
        initial: {
            page: 1,
            sort: 'updated_at:desc',
            type: '',
            filters: [],
        },
    });

    const availableFilters = data?.filtersList ?? data?.filters ?? data?.availableFilters;
    const activeFilters: string[] = Array.isArray(filters?.filters)
        ? filters.filters
        : filters?.filters
        ? String(filters.filters).split(',').filter(Boolean)
        : [];

    return (
        <div className="mx-auto flex flex-col gap-5 px-7 mt-2">
            <div className={'grid grid-cols-5 gap-3'}>
                <AnimeFilters
                    filters={filters}
                    activeFilters={activeFilters}
                    availableFilters={availableFilters}
                    setFilters={setFilters}
                />
                <div className={'col-span-4 mt-3'}>
                    <div className={'mb-5 grid grid-cols-3 items-center justify-between'}>
                        <div>Home / Anime</div>
                        <h2 className={'mb-1 text-center text-2xl font-bold'}>Anime</h2>
                        <div className={`justify-self-end`}>
                            <Pagination items={data?.pagination} onPageChange={(page) => setFilters({ page })} />
                        </div>
                    </div>
                    <AnimeList data={data?.anime} />
                </div>
            </div>
        </div>
    );
}
