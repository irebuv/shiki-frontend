import { Anime } from '@/types/anime';
import { AnimeCard } from './AnimeCard';

interface AnimeProps {
    data: Anime[];
}

export default function AnimeList({ data }: AnimeProps) {
    if (!data?.length) {
        return <div className="mt-4 text-4xl">There's no data here...</div>;
    }
    return (
        <div className="grid xl:grid-cols-6 lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-1 gap-8">
            {data.map((el) => (
                <AnimeCard key={el.id} anime={el} />
            ))}
        </div>
    );
}
