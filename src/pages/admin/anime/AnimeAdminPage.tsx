import { CustomAdminTable } from '@/components/admin/CustomAdminTable/CustomAdminTable';
import { useQueryData } from '@/hooks/useQueryData';
import { buildAnimeTableConfig } from '@/modules/config/admin/table/animeTable.config';
import { AnimeResponse } from '@/types/anime';
import { Pagination } from '@/components/custom/Pagination';
import { LoadingOverlay } from '@/components/shared/LoadingOverlay';
import { QueryState } from '@/components/custom/QueryState';

export default function AnimeAdminPage() {
    const { data, loading, error, setFilters, refetch } = useQueryData<AnimeResponse, {}>({
        url: '/admin/anime',
        initial: {
            page: 1,
        },
    });
    console.log("anime", data)
    const from = ((data?.pagination?.current_page ?? 1) - 1) * (data?.pagination?.per_page ?? 0);
    const studioOptions = (data?.studios ?? []).map((studio) => ({
        value: studio.id,
        label: studio.name,
    }));
    const animeTableConfig = buildAnimeTableConfig(studioOptions);

    return (
        <QueryState
            error={error}
            loading={loading}
            onRetry={refetch}
            className="size-full flex flex-col gap-4"
            overlay={<LoadingOverlay />}
        >
            <CustomAdminTable
                columns={animeTableConfig.columns}
                actions={animeTableConfig.actions}
                formFields={animeTableConfig.formFields}
                modalTitle="Anime"
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
        </QueryState>
    );
}
