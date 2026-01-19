import { ErrorState } from '@/components/custom/ErrorState';
import { CustomTable } from '@/components/ui/custom/CustomTable';
import { useDescriptionLines } from '@/hooks/useDescriptionLines';
import { useQueryData } from '@/hooks/useQueryData';
import { animeTableConfig } from '@/modules/config/table/animeTable.config';
import { AnimeResponse } from '@/types/anime';
import { Spinner } from '@radix-ui/themes';

export default function AnimeAdminPage() {
    const { data, loading, error } = useQueryData<AnimeResponse, {}>({
        url: '/admin/anime',
        initial: {},
    });
    console.log('test',data)
if (loading) return <Spinner />;

if (error) {
  const status = error?.response?.status;
  return (
    <ErrorState
      title={status === 403 ? "Forbidden" : "Something went wrong"}
      description={error?.response?.data?.message ?? error.message}
    />
  );
}
    return (
        <>
            <CustomTable 
                columns={animeTableConfig.columns}
                actions={animeTableConfig.actions}
                data={data.anime}
            />
        </>
    );
}
