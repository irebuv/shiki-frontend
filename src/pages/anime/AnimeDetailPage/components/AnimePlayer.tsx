import { videoUrl } from '@/lib/videoUrl';
import type { EpisodeItem, EpisodeMediaItem } from '@/types/anime';
import { useEffect, useMemo, useState } from 'react';

type AnimePlayerProps = {
    episodes?: EpisodeItem[];
};

const isPlayableMedia = (media: EpisodeMediaItem) => {
    const src = media.url ?? media.path;
    if (!src) return false;
    if (!media.type) return true;
    return ['video', 'stream', 'hls'].includes(String(media.type).toLowerCase());
};

const getEpisodeLabel = (episode: EpisodeItem) => {
    const season = episode.season_number ?? 1;
    const number = episode.episode_number ?? '?';
    const title = episode.title ? ` - ${episode.title}` : '';
    return `S${season}E${number}${title}`;
};

const getMediaLabel = (media: EpisodeMediaItem) => {
    const quality = media.quality ? String(media.quality) : 'Default';
    const language = media.language ? ` (${media.language})` : '';
    return `${quality}${language}`;
};

export const AnimePlayer = ({ episodes = [] }: AnimePlayerProps) => {
    const playableEpisodes = useMemo(
        () =>
            episodes
                .map((episode) => ({
                    ...episode,
                    media: (episode.media ?? []).filter(isPlayableMedia),
                }))
                .filter((episode) => (episode.media ?? []).length > 0),
        [episodes],
    );

    const [episodeId, setEpisodeId] = useState<number | null>(playableEpisodes[0]?.id ?? null);
    const currentEpisode = useMemo(
        () => playableEpisodes.find((episode) => episode.id === episodeId) ?? playableEpisodes[0],
        [playableEpisodes, episodeId],
    );

    const [mediaId, setMediaId] = useState<number | null>(currentEpisode?.media?.[0]?.id ?? null);
    const currentMedia = useMemo(
        () => currentEpisode?.media?.find((media) => media.id === mediaId) ?? currentEpisode?.media?.[0],
        [currentEpisode, mediaId],
    );

    useEffect(() => {
        setEpisodeId(playableEpisodes[0]?.id ?? null);
    }, [playableEpisodes]);

    useEffect(() => {
        setMediaId(currentEpisode?.media?.[0]?.id ?? null);
    }, [currentEpisode?.id]);

    if (!playableEpisodes.length) {
        return (
            <div className="rounded-2xl bg-background-light/60 p-5 ring-1 ring-black/10">
                <p className="text-sm text-muted-foreground">No video sources are available yet.</p>
            </div>
        );
    }

    const src = currentMedia?.url ?? currentMedia?.path;

    return (
        <div className="rounded-2xl bg-background-light/60 p-3 shadow-sm ring-1 ring-black/10">
            <div className="mb-3 flex flex-wrap gap-2">
                {playableEpisodes.map((episode) => (
                    <button
                        key={episode.id}
                        type="button"
                        className={[
                            'rounded-lg px-3 py-1.5 text-xs font-semibold transition',
                            episode.id === currentEpisode?.id
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-background hover:bg-background/80',
                        ].join(' ')}
                        onClick={() => setEpisodeId(episode.id)}
                    >
                        {getEpisodeLabel(episode)}
                    </button>
                ))}
            </div>

            <div className="mb-3 flex flex-wrap gap-2">
                {(currentEpisode?.media ?? []).map((media) => (
                    <button
                        key={media.id}
                        type="button"
                        className={[
                            'rounded-md px-2.5 py-1 text-xs transition',
                            media.id === currentMedia?.id
                                ? 'bg-amber-500 text-white'
                                : 'bg-background hover:bg-background/80',
                        ].join(' ')}
                        onClick={() => setMediaId(media.id)}
                    >
                        {getMediaLabel(media)}
                    </button>
                ))}
            </div>

            <div className="overflow-hidden rounded-xl bg-black">
                {src ? (
                    <video key={`${currentEpisode?.id}-${currentMedia?.id}`} controls preload="metadata" className="aspect-video w-full">
                        <source src={videoUrl(src)} type={currentMedia?.mime ?? undefined} />
                    </video>
                ) : (
                    <div className="flex aspect-video items-center justify-center text-sm text-white/80">
                        Selected source has no URL.
                    </div>
                )}
            </div>
        </div>
    );
};
