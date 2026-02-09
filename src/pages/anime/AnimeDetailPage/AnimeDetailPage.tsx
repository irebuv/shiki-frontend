import api from '@/api/axios';
import { QueryState } from '@/components/custom/QueryState';
import { LoadingOverlay } from '@/components/shared/LoadingOverlay';
import { imageUrl } from '@/lib/imageUrl';
import type { Anime, AnimeDetailResponse, EpisodeItem } from '@/types/anime';
import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { AnimeDetailHeader } from './components/AnimeDetailHeader';
import { AnimeDetailInfoGrid } from './components/AnimeDetailInfoGrid';
import { AnimeCoverCard } from './components/AnimeCoverCard';
import { AnimePlayer } from './components/AnimePlayer';

export default function AnimeDetailPage() {
    const { slug } = useParams<{ slug: string }>();
    const [anime, setAnime] = useState<Anime | null>(null);
    const [episodeItems, setEpisodeItems] = useState<EpisodeItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<any>(null);

    const load = useCallback(async () => {
        if (!slug) return;
        setLoading(true);
        setError(null);
        try {
            const res = await api.get<AnimeDetailResponse>(`/anime/${slug}`);
            setAnime(res.data.anime);
            setEpisodeItems(Array.isArray(res.data.episode_items) ? res.data.episode_items : []);
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    }, [slug]);

    useEffect(() => {
        load();
    }, [load]);

    const typeLabelMap: Record<string, string> = {
        tv_short: 'TV Short',
        tv_medium: 'TV Medium',
        tv_long: 'TV Long',
        movie: 'Movie',
        ova: 'OVA',
        ona: 'ONA',
    };

    const ratingLabel =
        anime?.rating !== null && anime?.rating !== undefined && anime?.rating !== ''
            ? String(anime.rating)
            : '-';
    const coverUrl = anime?.featured_image_url ?? imageUrl(anime?.featured_image);

    return (
        <QueryState
            loading={loading}
            error={error}
            onRetry={load}
            overlay={<LoadingOverlay />}
            className="container mx-auto p-4"
        >
            <div className="grid grid-cols-7 gap-8 text-black">
                <div className="col-span-5 rounded-2xl bg-background-light/60 p-6 shadow-sm ring-1 ring-black/10">
                    <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_230px]">
                        <div className="flex flex-col gap-4">
                            <AnimeDetailHeader
                                name={anime?.name}
                                description={anime?.description}
                                ratingLabel={ratingLabel}
                                status={anime?.status}
                                type={anime?.type}
                                ageRating={anime?.age_rating}
                                season={anime?.season}
                                seasonYear={anime?.season_year}
                                typeLabelMap={typeLabelMap}
                            />
                            <AnimeDetailInfoGrid
                                status={anime?.status}
                                type={anime?.type}
                                seasonYear={anime?.season_year}
                                season={anime?.season}
                                ageRating={anime?.age_rating}
                                studioName={anime?.studio?.name ?? null}
                                studioImage={anime?.studio?.image ?? null}
                                episodes={anime?.episodes}
                                episodeTime={anime?.episode_time}
                                typeLabelMap={typeLabelMap}
                            />
                        </div>

                        <AnimeCoverCard coverUrl={coverUrl} title={anime?.name ?? 'Anime cover'} />
                    </div>
                </div>
                <div className="col-span-2 rounded-2xl bg-background-light/60 p-6 shadow-sm ring-1 ring-black/10">
                    fff
                </div>
                <div className="col-span-7 rounded-2xl bg-background-light/60 p-1 shadow-sm ring-1 ring-black/10">
                    <AnimePlayer episodes={episodeItems} />
                </div>
            </div>
        </QueryState>
    );
}
