import { videoUrl } from '@/lib/videoUrl';
import type { EpisodeItem, EpisodeMediaItem } from '@/types/anime';
import { Maximize2, Minimize2, Pause, Play, Volume2, VolumeX } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

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
    const number = episode.episode_number ?? '?';
    const title = episode.title ? ` - ${episode.title}` : '';
    return `${number}${title}`;
};

const formatTime = (seconds: number) => {
    if (!Number.isFinite(seconds) || seconds <= 0) return '0:00';

    const total = Math.floor(seconds);
    const hours = Math.floor(total / 3600);
    const minutes = Math.floor((total % 3600) / 60);
    const secs = total % 60;

    if (hours > 0) {
        return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }

    return `${minutes}:${String(secs).padStart(2, '0')}`;
};

export const AnimePlayer = ({ episodes = [] }: AnimePlayerProps) => {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const playerContainerRef = useRef<HTMLDivElement | null>(null);
    const controlsHideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
        () =>
            currentEpisode?.media?.find((media) => media.id === mediaId) ??
            currentEpisode?.media?.[0],
        [currentEpisode, mediaId],
    );
    const [isPlaying, setIsPlaying] = useState(false);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [controlsVisible, setControlsVisible] = useState(true);

    useEffect(() => {
        setEpisodeId(playableEpisodes[0]?.id ?? null);
    }, [playableEpisodes]);

    useEffect(() => {
        setMediaId(currentEpisode?.media?.[0]?.id ?? null);
    }, [currentEpisode?.id]);

    useEffect(() => {
        const onFullscreenChange = () => {
            setIsFullscreen(document.fullscreenElement === playerContainerRef.current);
        };

        document.addEventListener('fullscreenchange', onFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
    }, []);

    const rawSrc = String(currentMedia?.url ?? currentMedia?.path ?? '').trim();
    const mappedSrc = rawSrc !== '' ? String(videoUrl(rawSrc) ?? '').trim() : '';
    const src = mappedSrc !== '' ? mappedSrc : null;

    const clearControlsHideTimeout = useCallback(() => {
        if (!controlsHideTimeoutRef.current) return;
        clearTimeout(controlsHideTimeoutRef.current);
        controlsHideTimeoutRef.current = null;
    }, []);

    const scheduleControlsHide = useCallback(() => {
        clearControlsHideTimeout();
        if (!isPlaying) {
            setControlsVisible(true);
            return;
        }

        controlsHideTimeoutRef.current = setTimeout(() => {
            setControlsVisible(false);
        }, 1800);
    }, [clearControlsHideTimeout, isPlaying]);

    const revealControls = useCallback(() => {
        setControlsVisible(true);
        scheduleControlsHide();
    }, [scheduleControlsHide]);

    const togglePlay = async () => {
        const video = videoRef.current;
        if (!video) return;

        if (video.paused) {
            try {
                await video.play();
            } catch {
                // ignore play() errors caused by browser policy
            }
            return;
        }

        video.pause();
    };

    const handleSeek = (value: number) => {
        const video = videoRef.current;
        if (!video || !Number.isFinite(value)) return;

        video.currentTime = value;
        setCurrentTime(value);
    };

    const handleVolume = (value: number) => {
        const video = videoRef.current;
        if (!video || !Number.isFinite(value)) return;

        const nextVolume = Math.max(0, Math.min(1, value));
        video.volume = nextVolume;
        setVolume(nextVolume);

        const nextMuted = nextVolume === 0;
        video.muted = nextMuted;
        setIsMuted(nextMuted);
    };

    const toggleMute = () => {
        const video = videoRef.current;
        if (!video) return;

        const nextMuted = !video.muted;
        video.muted = nextMuted;
        setIsMuted(nextMuted);
    };

    const toggleFullscreen = async () => {
        const container = playerContainerRef.current;
        if (!container) return;

        try {
            if (document.fullscreenElement === container) {
                await document.exitFullscreen();
                return;
            }

            await container.requestFullscreen();
        } catch {
            // fullscreen can be blocked by browser policy
        }
    };

    useEffect(() => {
        if (!isPlaying) {
            clearControlsHideTimeout();
            setControlsVisible(true);
            return;
        }

        scheduleControlsHide();
    }, [isPlaying, clearControlsHideTimeout, scheduleControlsHide]);

    useEffect(() => {
        setControlsVisible(true);
        clearControlsHideTimeout();
    }, [currentEpisode?.id, currentMedia?.id, clearControlsHideTimeout]);

    useEffect(() => {
        return () => {
            clearControlsHideTimeout();
        };
    }, [clearControlsHideTimeout]);

    if (!playableEpisodes.length) {
        return (
            <div className="rounded-2xl bg-background-light/60 p-5 ring-1 ring-black/10">
                <p className="text-sm text-muted-foreground">No video sources are available yet.</p>
            </div>
        );
    }

    return (
        <div className="rounded-2xl bg-background-light/60 p-3 shadow-sm ring-1 ring-black/10 text-foreground">
            <div className="mb-3 flex flex-wrap gap-2">
                {playableEpisodes.map((episode) => (
                    <button
                        key={episode.id}
                        type="button"
                        className={[
                            'cursor-pointer rounded-lg border px-5 py-3 font-semibold transition',
                            episode.id === currentEpisode?.id
                                ? 'bg-chart-1/80 text-primary-foreground'
                                : 'bg-background hover:bg-background/80',
                        ].join(' ')}
                        onClick={() => setEpisodeId(episode.id)}
                    >
                        {getEpisodeLabel(episode)}
                    </button>
                ))}
            </div>

            <div
                ref={playerContainerRef}
                className="relative overflow-hidden rounded-xl bg-black"
                onMouseMove={revealControls}
                onMouseEnter={revealControls}
                onTouchStart={revealControls}
                onMouseLeave={() => {
                    if (!isPlaying) return;
                    clearControlsHideTimeout();
                    setControlsVisible(false);
                }}
            >
                {src ? (
                    <>
                        <video
                            key={`${currentEpisode?.id}-${currentMedia?.id}`}
                            ref={videoRef}
                            src={src ?? undefined}
                            preload="metadata"
                            className="aspect-video w-full cursor-pointer bg-black"
                            onClick={() => {
                                void togglePlay();
                                revealControls();
                            }}
                            onPlay={() => setIsPlaying(true)}
                            onPause={() => setIsPlaying(false)}
                            onEnded={() => setIsPlaying(false)}
                            onLoadedMetadata={(event) => {
                                const nextDuration = Number(event.currentTarget.duration ?? 0);
                                setDuration(Number.isFinite(nextDuration) ? nextDuration : 0);
                                setCurrentTime(Number(event.currentTarget.currentTime ?? 0));
                            }}
                            onTimeUpdate={(event) => {
                                setCurrentTime(Number(event.currentTarget.currentTime ?? 0));
                            }}
                        />

                        {!isPlaying && (
                            <button
                                type="button"
                                className={[
                                    'absolute inset-0 z-10 m-auto flex size-24 cursor-pointer items-center justify-center rounded-full bg-black/45 text-white ring-1 ring-white/30 transition hover:bg-black/60',
                                    controlsVisible || !isPlaying ? 'opacity-100' : 'pointer-events-none opacity-0',
                                ].join(' ')}
                                onClick={() => {
                                    void togglePlay();
                                    revealControls();
                                }}
                                aria-label="Play"
                            >
                                <Play className="ml-1 size-11 fill-current" />
                            </button>
                        )}

                        <div
                            className={[
                                'absolute inset-x-0 bottom-0 z-20 bg-linear-to-t from-black/80 via-black/50 to-transparent px-3 pb-3 pt-8 transition-opacity duration-200',
                                controlsVisible || !isPlaying ? 'opacity-100' : 'pointer-events-none opacity-0',
                            ].join(' ')}
                        >
                            <input
                                type="range"
                                min={0}
                                max={Math.max(duration, 0)}
                                step={0.1}
                                value={duration > 0 ? Math.min(currentTime, duration) : 0}
                                onChange={(event) => handleSeek(Number(event.target.value))}
                                className="h-1.5 w-full cursor-pointer accent-chart-1"
                                aria-label="Seek"
                                disabled={duration <= 0}
                            />

                            <div className="mt-2 flex items-center justify-between gap-3 text-xs text-white">
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        className="inline-flex cursor-pointer items-center justify-center rounded-md p-1.5 hover:bg-white/15"
                                        onClick={() => {
                                            void togglePlay();
                                        }}
                                        aria-label={isPlaying ? 'Pause' : 'Play'}
                                    >
                                        {isPlaying ? <Pause className="size-4" /> : <Play className="size-4" />}
                                    </button>

                                    <span className="min-w-[92px] font-medium tabular-nums">
                                        {formatTime(currentTime)} / {formatTime(duration)}
                                    </span>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        className="inline-flex cursor-pointer items-center justify-center rounded-md p-1.5 hover:bg-white/15"
                                        onClick={toggleMute}
                                        aria-label={isMuted ? 'Unmute' : 'Mute'}
                                    >
                                        {isMuted || volume <= 0 ? (
                                            <VolumeX className="size-4" />
                                        ) : (
                                            <Volume2 className="size-4" />
                                        )}
                                    </button>

                                    <input
                                        type="range"
                                        min={0}
                                        max={1}
                                        step={0.01}
                                        value={isMuted ? 0 : volume}
                                        onChange={(event) => handleVolume(Number(event.target.value))}
                                        className="h-1.5 w-20 cursor-pointer accent-chart-2"
                                        aria-label="Volume"
                                    />

                                    <button
                                        type="button"
                                        className="inline-flex cursor-pointer items-center justify-center rounded-md p-1.5 hover:bg-white/15"
                                        onClick={() => {
                                            void toggleFullscreen();
                                        }}
                                        aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
                                    >
                                        {isFullscreen ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex aspect-video items-center justify-center text-sm text-white/80">
                        Selected source has no URL.
                    </div>
                )}
            </div>
        </div>
    );
};
