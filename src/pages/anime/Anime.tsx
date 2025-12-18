import MainLayout from '@/components/layout/MainLayout';
import { useQueryData } from '@/hooks/useQueryData';
import { AnimeResponse } from '@/types/anime';
import AnimeList from './component/AnimeList';
import { Pagination } from '@/components/custom/pagination';

export default function Anime() {
    const { data, setFilters } = useQueryData<AnimeResponse, { page: number }>({
        url: '/anime',
        initial: {
            page: 1,
        },
    });
    console.log('anime', data);
    return (
        <MainLayout className="mx-auto flex flex-col gap-5 px-7">
            <div className={'grid grid-cols-5 gap-3'}>
                <div>f</div>
                <div className={'col-span-4 mt-3'}>
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
                    <AnimeList data={data?.anime} />
                </div>
            </div>
        </MainLayout>
    );
}
