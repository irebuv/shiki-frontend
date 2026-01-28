import { CustomAdminTable } from '@/components/admin/CustomAdminTable/CustomAdminTable';
import { QueryState } from '@/components/custom/QueryState';
import { LoadingOverlay } from '@/components/shared/LoadingOverlay';
import { useQueryData } from '@/hooks/useQueryData';
import { buildFilterGroupsTableConfig } from '@/modules/config/admin/table/filterGroupsTable.config';
import type { FilterGroupsAdminResponse } from '@/types/filters';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import api from '@/api/axios';
import { toast } from '@/components/custom/Sonner';

export default function FilterAdminPage() {
    const { data, loading, error, refetch } = useQueryData<FilterGroupsAdminResponse, {}>({
        url: '/admin/filter-groups',
        initial: {},
    });
    const pendingDeleteTimersRef = useRef<Map<number, number>>(new Map());

    useEffect(() => {
        return () => {
            pendingDeleteTimersRef.current.forEach((timerId) => window.clearTimeout(timerId));
            pendingDeleteTimersRef.current.clear();
        };
    }, []);

    const handleDeleteFilter = useCallback(
        async (filterId: number) => {
            const existingTimer = pendingDeleteTimersRef.current.get(filterId);
            if (existingTimer) {
                window.clearTimeout(existingTimer);
                pendingDeleteTimersRef.current.delete(filterId);
            }

            const timerId = window.setTimeout(async () => {
                try {
                    const res = await api.delete(`/admin/filters/${filterId}`);
                    const msg = res?.data?.message ?? 'Filter deleted successfully';
                    toast.success(msg);
                } finally {
                    pendingDeleteTimersRef.current.delete(filterId);
                    refetch?.();
                }
            }, 10000);

            pendingDeleteTimersRef.current.set(filterId, timerId);

            toast('Filter will be deleted in 10 seconds', {
                duration: 10000,
                action: {
                    label: 'Undo',
                    onClick: () => {
                        const pendingId = pendingDeleteTimersRef.current.get(filterId);
                        if (pendingId) {
                            window.clearTimeout(pendingId);
                            pendingDeleteTimersRef.current.delete(filterId);
                            toast.success('Deletion canceled');
                        }
                    },
                },
            });
        },
        [refetch],
    );

    const tableConfig = useMemo(
        () => buildFilterGroupsTableConfig({ onDeleteFilter: handleDeleteFilter }),
        [handleDeleteFilter],
    );

    return (
        <QueryState
            error={error}
            loading={loading}
            onRetry={refetch}
            className="size-full flex flex-col gap-4"
            overlay={<LoadingOverlay />}
        >
            <CustomAdminTable
                columns={tableConfig.columns}
                actions={tableConfig.actions}
                formFields={tableConfig.formFields}
                modalTitle="Filter group"
                data={data?.filterGroups ?? []}
                isModal={true}
                refetch={refetch}
                createUrl="/admin/filter-groups"
            />
        </QueryState>
    );
}
