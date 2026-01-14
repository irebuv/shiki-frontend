import { CustomTable } from '@/components/ui/custom/CustomTable';
import { useQueryData } from '@/hooks/useQueryData';
import { AnimeResponse } from '@/types/anime';

export default function AnimeAdminPage() {
    const { data } = useQueryData<AnimeResponse, {}>({
        url: '/admin/anime',
        initial: {},
    });
    console.log(data)

    return (
        <>
            <CustomTable />
        </>
    );
}
