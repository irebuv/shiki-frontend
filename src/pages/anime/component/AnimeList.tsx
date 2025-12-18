import { Anime } from '@/types/anime';

interface AnimeProps {
    data: Anime[];
}

export default function AnimeList({ data }: AnimeProps) {
    if (!data?.length) {
        return <div className="mt-4 text-4xl">There's no data here...</div>;
    }
    console.log(data);
    return (
        <div className="grid xl:grid-cols-6 lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-1 gap-8">
            {data.map((el) => (
                <div className={'cursor-pointer'} key={el.id}>
                    <img
                        className={'aspect-2/3 w-full object-cover'}
                        src={`http://localhost:8082/storage/${el.featured_image}`}
                        alt={el.featured_image}
                    />
                    <p>{el.name}</p>
                </div>
            ))}
        </div>
    );
}
