import { CustomAdminTable } from '@/components/admin/CustomAdminTable/CustomAdminTable';
import { QueryState } from '@/components/custom/QueryState';
import { LoadingOverlay } from '@/components/shared/LoadingOverlay';
import { useQueryData } from '@/hooks/useQueryData';
import { studioTableConfig } from '@/modules/config/admin/table/studioTable.config';

type Studio = {
    id: number;
    name: string;
    slug?: string | null;
    description?: string | null;
    image?: string | null;
    created_at?: string | null;
    updated_at?: string | null;
};

type StudioAdminResponse = {
    studios: Studio[];
};

export default function StudioAdminPage() {
    const { data, loading, error, refetch } = useQueryData<
        StudioAdminResponse,
        Record<string, never>
    >({
        url: '/admin/studios',
        initial: {},
    });
    console.log(data);
    return (
        <QueryState
            error={error}
            loading={loading}
            onRetry={refetch}
            className="size-full flex flex-col gap-4"
            overlay={<LoadingOverlay />}
        >
            <CustomAdminTable
                data={data?.studios ?? []}
                columns={studioTableConfig.columns}
                actions={studioTableConfig.actions}
                formFields={studioTableConfig.formFields}
                modalTitle="Studio"
                isModal={true}
                refetch={refetch}
                createUrl="/admin/studios"
            />
        </QueryState>
    );
}
