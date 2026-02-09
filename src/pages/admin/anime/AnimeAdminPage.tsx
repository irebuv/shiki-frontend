import { CustomAdminTable } from '@/components/admin/CustomAdminTable/CustomAdminTable';
import { useQueryData } from '@/hooks/useQueryData';
import { buildAnimeTableConfig } from '@/modules/config/admin/table/animeTable.config';
import { AnimeResponse } from '@/types/anime';
import { Pagination } from '@/components/custom/Pagination';
import { LoadingOverlay } from '@/components/shared/LoadingOverlay';
import { QueryState } from '@/components/custom/QueryState';
import { useMemo, useState } from 'react';
import type { AdminTableRow } from '@/types/admin/adminTable';
import { AnimeVideoManagerModal } from './components/AnimeVideoManagerModal';

type VideoAnimeRef = {
    id: number;
    name?: string;
};

export default function AnimeAdminPage() {
    const [videoModalOpen, setVideoModalOpen] = useState(false);
    const [selectedAnime, setSelectedAnime] = useState<VideoAnimeRef | null>(null);

    const { data, loading, error, setFilters, refetch } = useQueryData<AnimeResponse, {}>({
        url: '/admin/anime',
        initial: {
            page: 1,
        },
    });

    const from = ((data?.pagination?.current_page ?? 1) - 1) * (data?.pagination?.per_page ?? 0);

    const studioOptions = useMemo(
        () =>
            (data?.studios ?? []).map((studio) => ({
                value: studio.id,
                label: studio.name,
            })),
        [data?.studios],
    );

    const animeTableConfig = useMemo(
        () =>
            buildAnimeTableConfig(studioOptions, {
                onVideoClick: (row: AdminTableRow) => {
                    setSelectedAnime({
                        id: row.id,
                        name: typeof row.name === 'string' ? row.name : undefined,
                    });
                    setVideoModalOpen(true);
                },
            }),
        [studioOptions],
    );

    return (
        <>
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

            <AnimeVideoManagerModal
                open={videoModalOpen}
                onOpenChange={(open) => {
                    setVideoModalOpen(open);
                    if (!open) setSelectedAnime(null);
                }}
                anime={selectedAnime}
            />
        </>
    );
}
