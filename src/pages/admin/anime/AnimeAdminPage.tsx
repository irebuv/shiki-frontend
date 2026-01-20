import { ErrorState } from '@/components/custom/ErrorState';
import { CustomAdminTable } from '@/components/admin/CustomAdminTable/CustomAdminTable';
import { useQueryData } from '@/hooks/useQueryData';
import { animeTableConfig } from '@/modules/config/table/animeTable.config';
import { AnimeResponse } from '@/types/anime';
import { Spinner } from '@radix-ui/themes';
import { Pagination } from '@/components/custom/Pagination';

export default function AnimeAdminPage() {
    const { data, loading, error, setFilters } = useQueryData<AnimeResponse, {}>({
        url: '/admin/anime',
        initial: {
            page: 1,
        },
    });
    console.log('test', data);
    if (loading) return <div className='grid w-full min-h-[60vh] place-items-center scale-200'><Spinner /></div>;

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
    const formFields = [
        { id: "name", name: "name", label: "Name", type: "text" },
        {
            id: "description",
            name: "description",
            label: "Description",
            type: "textarea",
        },
        { id: "type", name: "type", label: "Type", type: "select" },
        { id: "image", name: "image", label: "Image", type: "file" },
    ];
    return (
        <div className='flex flex-col gap-4'>
            <CustomAdminTable
                columns={animeTableConfig.columns}
                actions={animeTableConfig.actions}
                data={data.anime}
                isModal={true}
                from={from}
                modalTitle={'Modal title'}
                modalDescription={'Modal desc'}
                formFields={formFields}
            />
            <div className='ml-auto'>
            <Pagination items={data.pagination} onPageChange={(page) => setFilters({page})} />
            </div>
        </div>
    );
}
