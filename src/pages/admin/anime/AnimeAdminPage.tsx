import { ErrorState } from '@/components/custom/ErrorState';
import { CustomAdminTable } from '@/components/admin/CustomAdminTable/CustomAdminTable';
import { useQueryData } from '@/hooks/useQueryData';
import { animeTableConfig } from '@/modules/config/table/animeTable.config';
import { AnimeResponse } from '@/types/anime';
import { Spinner } from '@radix-ui/themes';
import { Pagination } from '@/components/custom/Pagination';

export default function AnimeAdminPage() {
    const { data, loading, error, setFilters, refetch, filters } = useQueryData<AnimeResponse, {}>({
        url: '/admin/anime',
        initial: {
            page: 1,
        },
    });
    console.log('test', data);
    const from = ((data?.pagination?.current_page ?? 1) - 1) * (data?.pagination?.per_page ?? 0);

    if (error) {
        const status = error?.response?.status;
        return (
            <ErrorState
                title={status === 403 ? 'Forbidden' : 'Something went wrong'}
                description={error?.response?.data?.message ?? error.message}
            />
        );
    }
   
    return (
        <div className="size-full relative flex flex-col gap-4">
            {loading && (
                <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/5 backdrop-blur-xs rounded-xl">
                    <div className="flex items-center gap-3 rounded-lg bg-background/80 px-4 py-3 shadow">
                        <div className="scale-150">
                            <Spinner />
                        </div>
                        <span className="text-sm text-foreground">Loading...</span>
                    </div>
                </div>
            )}
            <CustomAdminTable
                columns={animeTableConfig.columns}
                actions={animeTableConfig.actions}
                formFields={animeTableConfig.formFields}
                modalTitle="Anime"
                createLabel="Add new anime"
                data={data?.anime ?? []}
                isModal={true}
                from={from}
                refetch={refetch}
                createUrl="/admin/anime"
                filters={data?.filtersList ?? null}
            />
            {data?.pagination && (
                <div className="ml-auto">
                    <Pagination
                        items={data.pagination}
                        onPageChange={(page) => setFilters({ page })}
                    />
                </div>
            )}
        </div>
    );
}
