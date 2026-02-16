import api from '@/api/axios';
import { QueryState } from '@/components/custom/QueryState';
import { LoadingOverlay } from '@/components/shared/LoadingOverlay';
import { imageUrl } from '@/lib/imageUrl';
import type {
    Anime,
    AnimeDetailResponse,
    AnimeRelatedItem,
    AnimeSimilarItem,
    EpisodeItem,
} from '@/types/anime';
import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { AnimeDetailHeader } from './components/AnimeDetailHeader';
import { AnimeDetailInfoGrid } from './components/AnimeDetailInfoGrid';
import { AnimeCoverCard } from './components/AnimeCoverCard';
import { AnimePlayer } from './components/AnimePlayer';
import AnimeRelated from './components/AnimeRelated';
import AnimeSimilar from './components/AnimeSimilar';

export default function AnimeDetailPage() {
    const { slug } = useParams<{ slug: string }>();
    const [anime, setAnime] = useState<Anime | null>(null);
    const [episodeItems, setEpisodeItems] = useState<EpisodeItem[]>([]);
    const [relatedItems, setRelatedItems] = useState<AnimeRelatedItem[]>([]);
    const [similarItems, setSimilarItems] = useState<AnimeSimilarItem[]>([]);
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
            setRelatedItems(Array.isArray(res.data.related_items) ? res.data.related_items : []);
            setSimilarItems(Array.isArray(res.data.similar_items) ? res.data.similar_items : []);
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
    const episodesCount = episodeItems.length > 0 ? episodeItems.length : null;

    const ratingLabel =
        anime?.rating !== null && anime?.rating !== undefined && anime?.rating !== ''
            ? String(anime.rating)
            : '-';
    const featuredImageUrl = String(anime?.featured_image_url ?? '').trim();
    const coverUrl = featuredImageUrl !== '' ? featuredImageUrl : imageUrl(anime?.featured_image);
    console.log(similarItems);
    return (
        <QueryState
            loading={loading}
            error={error}
            onRetry={load}
            overlay={<LoadingOverlay />}
            className="container mx-auto p-4"
        >
            <div
                className="grid grid-cols-7 gap-5 text-foreground [&>.detail-block]:ring-1
                [&>.detail-block]:rounded-2xl [&>.detail-block]:bg-background-light/90
              [&>.detail-block]:ring-black/10 [&>.detail-block]:shadow-sm"
            >
                <div className="col-span-7 md:col-span-5 detail-block p-6">
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
                                episodesCount={episodesCount}
                                episodes={anime?.episodes}
                                typeLabelMap={typeLabelMap}
                            />
                        </div>

                        <AnimeCoverCard coverUrl={coverUrl} title={anime?.name ?? 'Anime cover'} />
                    </div>
                </div>
                <div className="col-span-7 md:col-span-2 p-6 detail-block">fff</div>
                {relatedItems.length !== 0 && (
                    <div className="col-span-7 detail-block p-6">
                        <AnimeRelated relatedItems={relatedItems} typeLabelMap={typeLabelMap} />
                    </div>
                )}
                <div className="col-span-7 detail-block p-1">
                    <AnimePlayer episodes={episodeItems} />
                </div>
                {similarItems.length !== 0 && (
                    <div className="col-span-7 detail-block p-1">
                        <AnimeSimilar similarItems={similarItems} typeLabelMap={typeLabelMap} />
                    </div>
                )}
            </div>
        </QueryState>
    );
}
