import api from '@/api/axios';
import { toast } from '@/components/custom/Sonner';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { EpisodeItem, EpisodeMediaItem } from '@/types/anime';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

type AnimeRef = {
    id: number;
    name?: string;
};

type AnimeVideoManagerModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    anime: AnimeRef | null;
};

type EpisodeListResponse = { episodes: EpisodeItem[] };
type EpisodeUpsertResponse = { message?: string; episode?: EpisodeItem };
type UploadSourceResponse = { message?: string; source_path?: string };
type TranscodeResponse = { message?: string; output?: string };

type TranscodeStage = 'idle' | 'probing' | 'transcoding' | 'done' | 'failed';

type TranscodeProgressPayload = {
    episode_id?: number;
    stage?: TranscodeStage;
    progress?: number;
    quality?: string | null;
    quality_index?: number;
    qualities_total?: number;
    quality_progress?: number;
    message?: string | null;
    error?: string | null;
    updated_at?: string;
};

type TranscodeProgressResponse = {
    progress?: TranscodeProgressPayload;
};

const PROGRESS_POLL_INTERVAL_MS = 10_000;
const VIDEO_FILE_REGEX = /\.(mp4|mkv|avi|mov|webm)$/i;
const DEFAULT_SEASON_NUMBER = 1;
const QUALITY_OPTIONS = ['1080', '720', '480'] as const;
const LANGUAGE_OPTIONS = [
    { value: 'ru', label: 'Russian (ru)' },
    { value: 'en', label: 'English (en)' },
] as const;

const toIntOrNull = (value: string) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed > 0 ? Math.trunc(parsed) : null;
};

const clampPercent = (value: number) => Math.max(0, Math.min(100, Math.round(value)));

const formatEpisodeLabel = (episode: EpisodeItem) => {
    const number = episode.episode_number ?? '?';
    const title = episode.title ? ` - ${episode.title}` : '';
    return `E${number}${title}`;
};

const isVideoFile = (file: File) => file.type.startsWith('video/') || VIDEO_FILE_REGEX.test(file.name);

export function AnimeVideoManagerModal({ open, onOpenChange, anime }: AnimeVideoManagerModalProps) {
    const [episodes, setEpisodes] = useState<EpisodeItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [busy, setBusy] = useState(false);

    const [episodeNumber, setEpisodeNumber] = useState('');
    const [episodeTitle, setEpisodeTitle] = useState('');

    const [selectedEpisodeId, setSelectedEpisodeId] = useState<number | null>(null);

    const [qualities, setQualities] = useState('1080');
    const [language, setLanguage] = useState('ru');

    const [activeEpisodeId, setActiveEpisodeId] = useState<number | null>(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [transcodeProgress, setTranscodeProgress] = useState(0);
    const [transcodeStage, setTranscodeStage] = useState<TranscodeStage>('idle');
    const [transcodeLabel, setTranscodeLabel] = useState('');
    const [transcodeQuality, setTranscodeQuality] = useState<string | null>(null);

    const [isDragActive, setIsDragActive] = useState(false);
    const dragDepthRef = useRef(0);

    const [dropDialogOpen, setDropDialogOpen] = useState(false);
    const [droppedVideo, setDroppedVideo] = useState<File | null>(null);
    const [dropEpisodeNumber, setDropEpisodeNumber] = useState('');
    const [dropEpisodeTitle, setDropEpisodeTitle] = useState('');
    const [dropQualities, setDropQualities] = useState('1080');
    const [dropLanguage, setDropLanguage] = useState('ru');

    const progressPollRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const episodeFileInputRefs = useRef<Record<number, HTMLInputElement | null>>({});

    const selectedEpisode = useMemo(
        () => episodes.find((episode) => episode.id === selectedEpisodeId) ?? null,
        [episodes, selectedEpisodeId],
    );

    const stopProgressPolling = useCallback(() => {
        if (!progressPollRef.current) return;
        clearInterval(progressPollRef.current);
        progressPollRef.current = null;
    }, []);

    const resetProgressState = useCallback(() => {
        stopProgressPolling();
        setActiveEpisodeId(null);
        setUploadProgress(0);
        setTranscodeProgress(0);
        setTranscodeStage('idle');
        setTranscodeLabel('');
        setTranscodeQuality(null);
    }, [stopProgressPolling]);

    const loadEpisodes = useCallback(async () => {
        if (!anime?.id || !open) return;
        setLoading(true);
        try {
            const res = await api.get<EpisodeListResponse>(`/admin/anime/${anime.id}/episodes`);
            setEpisodes(Array.isArray(res.data.episodes) ? res.data.episodes : []);
        } catch {
            setEpisodes([]);
        } finally {
            setLoading(false);
        }
    }, [anime?.id, open]);

    const pullTranscodeProgress = useCallback(
        async (episodeId: number) => {
            if (!anime?.id) return;

            try {
                const res = await api.get<TranscodeProgressResponse>(
                    `/admin/anime/${anime.id}/episodes/${episodeId}/transcode/progress`,
                );

                const payload = res.data.progress;
                if (!payload) return;

                const stage = (payload.stage ?? 'idle') as TranscodeStage;
                const progress = clampPercent(Number(payload.progress ?? 0));
                const quality = payload.quality ?? null;
                const qualityProgress = clampPercent(Number(payload.quality_progress ?? progress));

                setActiveEpisodeId(episodeId);
                setTranscodeStage(stage);
                setTranscodeProgress(progress);
                setTranscodeQuality(quality);

                if (stage === 'transcoding') {
                    const qualityPrefix = quality ? `${quality} - ` : '';
                    setTranscodeLabel(payload.message ?? `${qualityPrefix}${qualityProgress}%`);
                } else if (stage === 'probing') {
                    setTranscodeLabel(payload.message ?? 'Preparing source metadata...');
                } else if (stage === 'done') {
                    setTranscodeLabel(payload.message ?? 'Transcoding completed.');
                } else if (stage === 'failed') {
                    setTranscodeLabel(payload.error ?? payload.message ?? 'Transcoding failed.');
                } else {
                    setTranscodeLabel(payload.message ?? '');
                }

                if (stage === 'done' || stage === 'failed') {
                    stopProgressPolling();
                }
            } catch {
                // keep previous progress on transient polling errors
            }
        },
        [anime?.id, stopProgressPolling],
    );

    const startProgressPolling = useCallback(
        (episodeId: number) => {
            stopProgressPolling();
            void pullTranscodeProgress(episodeId);
            progressPollRef.current = setInterval(() => {
                void pullTranscodeProgress(episodeId);
            }, PROGRESS_POLL_INTERVAL_MS);
        },
        [pullTranscodeProgress, stopProgressPolling],
    );

    useEffect(() => {
        if (!open) return;
        loadEpisodes();
    }, [open, loadEpisodes]);

    useEffect(() => {
        if (!open) {
            dragDepthRef.current = 0;
            setIsDragActive(false);
            setDropDialogOpen(false);
            setDroppedVideo(null);
            resetProgressState();
        }
    }, [open, resetProgressState]);

    useEffect(() => {
        return () => {
            stopProgressPolling();
        };
    }, [stopProgressPolling]);

    useEffect(() => {
        if (transcodeStage === 'done') {
            void loadEpisodes();
        }
    }, [transcodeStage, loadEpisodes]);

    const createEpisodeRecord = useCallback(
        async (seasonNo: number, episodeNo: number, title?: string) => {
            if (!anime?.id) return null;
            try {
                const res = await api.post<EpisodeUpsertResponse>(`/admin/anime/${anime.id}/episodes`, {
                    season_number: seasonNo,
                    episode_number: episodeNo,
                    title: title?.trim() || undefined,
                });

                if (res.data.message) toast.success(res.data.message);
                const createdEpisodeId = res.data.episode?.id ?? null;

                await loadEpisodes();
                if (createdEpisodeId) {
                    setSelectedEpisodeId(createdEpisodeId);
                }

                return createdEpisodeId;
            } catch (error: any) {
                const serverMessage = String(error?.response?.data?.message ?? '').trim();
                toast.error(serverMessage || 'Failed to save episode.');
                return null;
            }
        },
        [anime?.id, loadEpisodes],
    );

    const saveEpisode = async () => {
        const episodeNo = toIntOrNull(episodeNumber);
        if (!episodeNo) {
            toast.error('Episode number is required.');
            return;
        }

        setBusy(true);
        try {
            await createEpisodeRecord(DEFAULT_SEASON_NUMBER, episodeNo, episodeTitle);
        } finally {
            setBusy(false);
        }
    };

    const deleteEpisode = async (episode: EpisodeItem) => {
        if (!anime?.id || !episode.id) return;
        if (!window.confirm(`Delete ${formatEpisodeLabel(episode)}?`)) return;

        setBusy(true);
        try {
            const res = await api.delete(`/admin/anime/${anime.id}/episodes/${episode.id}`);
            if (res?.data?.message) toast.success(res.data.message);

            if (selectedEpisodeId === episode.id) setSelectedEpisodeId(null);
            if (activeEpisodeId === episode.id) resetProgressState();

            await loadEpisodes();
        } finally {
            setBusy(false);
        }
    };

    const deleteMedia = async (episodeId: number, media: EpisodeMediaItem) => {
        if (!anime?.id || !media.id) return;
        if (!window.confirm(`Delete source ${media.quality ?? 'default'}?`)) return;

        setBusy(true);
        try {
            const res = await api.delete(
                `/admin/anime/${anime.id}/episodes/${episodeId}/media/${media.id}`,
            );
            if (res?.data?.message) toast.success(res.data.message);
            await loadEpisodes();
        } finally {
            setBusy(false);
        }
    };

    const startEpisodeUploadAndTranscode = useCallback(
        async (episodeId: number, file: File, qualitiesValue: string, languageValue: string) => {
            if (!anime?.id) return;
            if (!isVideoFile(file)) {
                toast.error('Please provide a valid video file.');
                return;
            }

            const activeTranscoding = transcodeStage === 'probing' || transcodeStage === 'transcoding';
            if (activeTranscoding && activeEpisodeId !== episodeId) {
                toast.error('Another episode is already transcoding.');
                return;
            }

            setBusy(true);
            setActiveEpisodeId(episodeId);
            setUploadProgress(0);
            setTranscodeProgress(0);
            setTranscodeStage('idle');
            setTranscodeLabel('');
            setTranscodeQuality(null);

            try {
                const formData = new FormData();
                formData.append('source', file);

                const uploadRes = await api.post<UploadSourceResponse>(
                    `/admin/anime/${anime.id}/episodes/${episodeId}/source`,
                    formData,
                    {
                        headers: { 'Content-Type': 'multipart/form-data' },
                        onUploadProgress: (event) => {
                            if (!event.total) return;
                            const progress = (event.loaded / event.total) * 100;
                            setUploadProgress(clampPercent(progress));
                        },
                    },
                );

                if (uploadRes.data.message) toast.success(uploadRes.data.message);
                const sourcePath = uploadRes.data.source_path ?? '';
                setUploadProgress(100);

                if (!sourcePath) {
                    toast.error('Upload finished but source path is empty.');
                    setTranscodeStage('failed');
                    setTranscodeLabel('Upload did not return source path.');
                    return;
                }

                setTranscodeStage('probing');
                setTranscodeLabel('Starting transcode...');

                try {
                    const transcodeRes = await api.post<TranscodeResponse>(
                        `/admin/anime/${anime.id}/episodes/${episodeId}/transcode`,
                        {
                            source_path: sourcePath,
                            qualities: qualitiesValue.trim() || '1080',
                            language: languageValue.trim() || 'ru',
                            overwrite: true,
                        },
                    );

                    if (transcodeRes.data.message) toast.success(transcodeRes.data.message);
                    startProgressPolling(episodeId);
                    await pullTranscodeProgress(episodeId);
                } catch (error: any) {
                    await pullTranscodeProgress(episodeId);

                    const output = String(error?.response?.data?.output ?? '').trim();
                    const serverMessage = String(error?.response?.data?.message ?? '').trim();

                    if (output) {
                        const shortOutput = output.length > 500 ? `${output.slice(0, 500)}...` : output;
                        toast.error(shortOutput);
                    } else if (serverMessage) {
                        toast.error(serverMessage);
                    } else {
                        toast.error('Transcoding failed.');
                    }

                    setTranscodeStage('failed');
                    setTranscodeLabel(output || serverMessage || 'Transcoding failed.');
                }
            } catch (error: any) {
                const serverMessage = String(error?.response?.data?.message ?? '').trim();
                const status = Number(error?.response?.status ?? 0);
                if (status === 409) {
                    toast.error(serverMessage || 'Another episode is already transcoding.');
                } else if (serverMessage) {
                    toast.error(serverMessage);
                } else {
                    toast.error('Upload failed.');
                }
                resetProgressState();
            } finally {
                setBusy(false);
            }
        },
        [
            anime?.id,
            transcodeStage,
            activeEpisodeId,
            startProgressPolling,
            pullTranscodeProgress,
            resetProgressState,
        ],
    );

    const openDropEpisodeDialog = useCallback(
        (file: File) => {
            if (!isVideoFile(file)) {
                toast.error('Please drop a valid video file (mp4, mkv, avi, mov, webm).');
                return;
            }

            const activeTranscoding = transcodeStage === 'probing' || transcodeStage === 'transcoding';
            if (activeTranscoding) {
                toast.error('Another episode is already transcoding.');
                return;
            }

            const nextEpisode =
                episodes.length > 0
                    ? Math.max(
                          1,
                          ...episodes.map((item) => Number(item.episode_number ?? 0)).filter((n) => n > 0),
                      ) + 1
                    : 1;

            setDroppedVideo(file);
            setDropEpisodeNumber(String(nextEpisode));
            setDropEpisodeTitle('');
            setDropQualities(qualities);
            setDropLanguage(language);
            setDropDialogOpen(true);
        },
        [episodes, qualities, language, transcodeStage],
    );

    const handleDropCreateAndStart = async () => {
        if (!droppedVideo) {
            toast.error('No video selected from drop action.');
            return;
        }

        const activeTranscoding = transcodeStage === 'probing' || transcodeStage === 'transcoding';
        if (activeTranscoding) {
            toast.error('Another episode is already transcoding.');
            return;
        }

        const episodeNo = toIntOrNull(dropEpisodeNumber);
        if (!episodeNo) {
            toast.error('Episode number is required.');
            return;
        }

        setBusy(true);
        try {
            const episodeId = await createEpisodeRecord(
                DEFAULT_SEASON_NUMBER,
                episodeNo,
                dropEpisodeTitle,
            );
            if (!episodeId) {
                toast.error('Episode was saved but id is missing.');
                return;
            }

            setQualities(dropQualities);
            setLanguage(dropLanguage);
            setDropDialogOpen(false);

            const fileToProcess = droppedVideo;
            setDroppedVideo(null);
            await startEpisodeUploadAndTranscode(
                episodeId,
                fileToProcess,
                dropQualities,
                dropLanguage,
            );
        } finally {
            setBusy(false);
        }
    };

    const handleEpisodeFileChange = async (
        event: React.ChangeEvent<HTMLInputElement>,
        episodeId: number,
    ) => {
        const file = event.target.files?.[0] ?? null;
        event.target.value = '';

        if (!file) return;
        await startEpisodeUploadAndTranscode(episodeId, file, qualities, language);
    };

    const onDialogDragEnter = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();

        dragDepthRef.current += 1;
        setIsDragActive(true);
    };

    const onDialogDragOver = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
        event.dataTransfer.dropEffect = 'copy';
    };

    const onDialogDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();

        dragDepthRef.current -= 1;
        if (dragDepthRef.current <= 0) {
            dragDepthRef.current = 0;
            setIsDragActive(false);
        }
    };

    const onDialogDrop = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();

        dragDepthRef.current = 0;
        setIsDragActive(false);

        const droppedFiles = Array.from(event.dataTransfer.files ?? []);
        const videoFile = droppedFiles.find(isVideoFile);

        if (!videoFile) {
            toast.error('Drop a video file (mp4, mkv, avi, mov, webm).');
            return;
        }

        openDropEpisodeDialog(videoFile);
    };

    const isTranscoding = transcodeStage === 'probing' || transcodeStage === 'transcoding';

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent
                    className="sm:max-w-5xl max-h-[90vh] overflow-hidden flex flex-col relative"
                    onDragEnter={onDialogDragEnter}
                    onDragOver={onDialogDragOver}
                    onDragLeave={onDialogDragLeave}
                    onDrop={onDialogDrop}
                >
                    {isDragActive && (
                        <div className="pointer-events-none absolute inset-3 z-30 flex items-center justify-center rounded-xl border-2 border-dashed border-primary bg-primary/10">
                            <div className="rounded-lg bg-background/90 px-4 py-3 text-center shadow-sm">
                                <p className="text-sm font-semibold">Drop video file here</p>
                                <p className="text-xs text-muted-foreground">
                                    Episode creation dialog will open automatically.
                                </p>
                            </div>
                        </div>
                    )}

                    {dropDialogOpen && (
                        <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/50 p-4">
                            <div className="w-full max-w-xl rounded-xl border bg-background p-5 shadow-2xl">
                                <div className="mb-4 space-y-1">
                                    <h3 className="text-xl font-semibold">Create Episode From Dropped Video</h3>
                                    <p className="text-sm text-muted-foreground break-all">
                                        {droppedVideo
                                            ? `File: ${droppedVideo.name}`
                                            : 'Drop a video file to create an episode.'}
                                    </p>
                                </div>

                                <div className="space-y-3">
                                    <div>
                                        <Label>Episode</Label>
                                        <Input
                                            value={dropEpisodeNumber}
                                            onChange={(e) => setDropEpisodeNumber(e.target.value)}
                                            placeholder="1"
                                        />
                                    </div>

                                    <div>
                                        <Label>Title</Label>
                                        <Input
                                            value={dropEpisodeTitle}
                                            onChange={(e) => setDropEpisodeTitle(e.target.value)}
                                            placeholder="Optional title"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <Label>Qualities</Label>
                                            <Select
                                                value={dropQualities}
                                                onValueChange={(value) => setDropQualities(value)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select quality" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {QUALITY_OPTIONS.map((quality) => (
                                                        <SelectItem key={quality} value={quality}>
                                                            {quality}p
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div>
                                            <Label>Language</Label>
                                            <Select
                                                value={dropLanguage}
                                                onValueChange={(value) => setDropLanguage(value)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select language" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {LANGUAGE_OPTIONS.map((lang) => (
                                                        <SelectItem key={lang.value} value={lang.value}>
                                                            {lang.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="flex justify-end gap-2 pt-1">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => {
                                                setDropDialogOpen(false);
                                                setDroppedVideo(null);
                                            }}
                                            disabled={busy}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            type="button"
                                            onClick={() => {
                                                void handleDropCreateAndStart();
                                            }}
                                            disabled={busy || !droppedVideo}
                                        >
                                            Create + Start
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <DialogHeader>
                        <DialogTitle>Video Manager</DialogTitle>
                        <DialogDescription>
                            Anime: {anime?.name ?? '-'} (ID: {anime?.id ?? '-'})
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid min-h-0 flex-1 gap-5 md:grid-cols-[340px_minmax(0,1fr)]">
                        <div className="space-y-4 overflow-y-auto pr-1">
                            <div className="rounded-xl border p-3 space-y-3">
                                <h4 className="text-sm font-semibold">Episode</h4>
                                <div>
                                    <Label>Episode</Label>
                                    <Input
                                        value={episodeNumber}
                                        onChange={(e) => setEpisodeNumber(e.target.value)}
                                        placeholder="1"
                                    />
                                </div>
                                <div>
                                    <Label>Title</Label>
                                    <Input
                                        value={episodeTitle}
                                        onChange={(e) => setEpisodeTitle(e.target.value)}
                                        placeholder="Optional title"
                                    />
                                </div>
                                <Button
                                    type="button"
                                    className="w-full"
                                    onClick={saveEpisode}
                                    disabled={busy}
                                >
                                    Save episode
                                </Button>
                            </div>

                            <div className="rounded-xl border p-3 space-y-3">
                                <h4 className="text-sm font-semibold">Transcode Defaults</h4>
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <Label>Qualities</Label>
                                        <Select
                                            value={qualities}
                                            onValueChange={(value) => setQualities(value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select quality" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {QUALITY_OPTIONS.map((quality) => (
                                                    <SelectItem key={quality} value={quality}>
                                                        {quality}p
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label>Language</Label>
                                        <Select
                                            value={language}
                                            onValueChange={(value) => setLanguage(value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select language" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {LANGUAGE_OPTIONS.map((lang) => (
                                                    <SelectItem key={lang.value} value={lang.value}>
                                                        {lang.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Drag a video into this window or use upload inside each episode.
                                </p>
                                {selectedEpisode && (
                                    <p className="text-xs text-muted-foreground">
                                        Selected: {formatEpisodeLabel(selectedEpisode)}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="min-h-0 overflow-y-auto rounded-xl border p-3">
                            <div className="mb-3 flex items-center justify-between">
                                <h4 className="text-sm font-semibold">Episodes</h4>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={loadEpisodes}
                                    disabled={loading || busy}
                                >
                                    Refresh
                                </Button>
                            </div>

                            {loading ? (
                                <p className="text-sm text-muted-foreground">Loading...</p>
                            ) : episodes.length === 0 ? (
                                <p className="text-sm text-muted-foreground">No episodes yet.</p>
                            ) : (
                                <div className="space-y-3">
                                    {episodes.map((episode) => {
                                        const isSelected = episode.id === selectedEpisodeId;
                                        const isActive = episode.id === activeEpisodeId;
                                        const isTranscodeRunning =
                                            isActive &&
                                            (transcodeStage === 'probing' || transcodeStage === 'transcoding');
                                        const isTranscodeDone = isActive && transcodeStage === 'done';
                                        const isTranscodeFailed = isActive && transcodeStage === 'failed';
                                        const showEpisodeOverlay =
                                            isActive && (uploadProgress > 0 || transcodeStage !== 'idle');
                                        const transcodeOverlayClass = isTranscodeDone
                                            ? 'bg-emerald-200/24'
                                            : isTranscodeFailed
                                              ? 'bg-red-200/24'
                                              : 'bg-transparent';
                                        const transcodeTextClass = isTranscodeDone
                                            ? 'text-emerald-700'
                                            : isTranscodeFailed
                                              ? 'text-red-700'
                                              : 'text-orange-700';
                                        const transcodeTrackClass = isTranscodeDone
                                            ? 'bg-emerald-100'
                                            : isTranscodeFailed
                                              ? 'bg-red-100'
                                              : 'bg-orange-100';
                                        const transcodeFillClass = isTranscodeDone
                                            ? 'bg-emerald-500'
                                            : isTranscodeFailed
                                              ? 'bg-red-500'
                                              : 'bg-orange-500';

                                        return (
                                            <div
                                                key={episode.id}
                                                className={[
                                                    'relative overflow-hidden rounded-lg border p-3',
                                                    isSelected ? 'border-primary' : '',
                                                ].join(' ')}
                                            >
                                                {showEpisodeOverlay && (
                                                    <>
                                                        <div
                                                            className="pointer-events-none absolute inset-y-0 left-0 bg-sky-200/30 transition-[width] duration-200"
                                                            style={{ width: `${uploadProgress}%` }}
                                                        />
                                                        <div
                                                            className={[
                                                                'pointer-events-none absolute inset-y-0 left-0 transition-[width] duration-300',
                                                                transcodeOverlayClass,
                                                            ].join(' ')}
                                                            style={{ width: `${transcodeProgress}%` }}
                                                        />
                                                    </>
                                                )}

                                                <div className="relative z-10">
                                                    <div className="mb-2 flex items-center justify-between gap-2">
                                                        <div className="text-sm font-semibold">
                                                            {formatEpisodeLabel(episode)}
                                                            {isActive && transcodeStage === 'probing' && (
                                                                <span className="ml-2 rounded bg-orange-100 px-1.5 py-0.5 text-[10px] text-orange-700">
                                                                    Probing...
                                                                </span>
                                                            )}
                                                            {isTranscodeRunning && (
                                                                <span className="ml-2 rounded bg-orange-100 px-1.5 py-0.5 text-[10px] text-orange-700">
                                                                    {transcodeProgress}%
                                                                </span>
                                                            )}
                                                            {isTranscodeFailed && (
                                                                <span className="ml-2 rounded bg-red-100 px-1.5 py-0.5 text-[10px] text-red-700">
                                                                    Failed
                                                                </span>
                                                            )}
                                                            {isTranscodeDone && (
                                                                <span className="ml-2 rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] text-emerald-700">
                                                                    Done
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => {
                                                                    setSelectedEpisodeId(episode.id);
                                                                    setEpisodeNumber(String(episode.episode_number ?? ''));
                                                                    setEpisodeTitle(episode.title ?? '');
                                                                }}
                                                            >
                                                                Select
                                                            </Button>

                                                            <input
                                                                ref={(node) => {
                                                                    episodeFileInputRefs.current[episode.id] = node;
                                                                }}
                                                                type="file"
                                                                className="hidden"
                                                                accept=".mp4,.mkv,.avi,.mov,.webm,video/*"
                                                                onChange={(event) => {
                                                                    void handleEpisodeFileChange(event, episode.id);
                                                                }}
                                                            />
                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => episodeFileInputRefs.current[episode.id]?.click()}
                                                                disabled={busy || (isTranscoding && activeEpisodeId !== episode.id)}
                                                            >
                                                                Upload
                                                            </Button>

                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => deleteEpisode(episode)}
                                                                disabled={busy || (isTranscoding && activeEpisodeId === episode.id)}
                                                            >
                                                                Delete
                                                            </Button>
                                                        </div>
                                                    </div>

                                                    {isActive && (uploadProgress > 0 || transcodeStage !== 'idle') && (
                                                        <div className="mb-2 space-y-1 rounded-md bg-background/70 p-2">
                                                            <div className="flex items-center justify-between text-[11px] text-sky-700">
                                                                <span>Upload</span>
                                                                <span>{uploadProgress}%</span>
                                                            </div>
                                                            <div className="h-1.5 rounded bg-sky-100">
                                                                <div
                                                                    className="h-full rounded bg-sky-500 transition-[width] duration-200"
                                                                    style={{ width: `${uploadProgress}%` }}
                                                                />
                                                            </div>
                                                            <div
                                                                className={[
                                                                    'flex items-center justify-between text-[11px]',
                                                                    transcodeTextClass,
                                                                ].join(' ')}
                                                            >
                                                                <span>
                                                                    Transcode
                                                                    {transcodeQuality ? ` (${transcodeQuality})` : ''}
                                                                </span>
                                                                <span>{transcodeProgress}%</span>
                                                            </div>
                                                            <div
                                                                className={[
                                                                    'h-1.5 rounded',
                                                                    transcodeTrackClass,
                                                                ].join(' ')}
                                                            >
                                                                <div
                                                                    className={[
                                                                        'h-full rounded transition-[width] duration-300',
                                                                        transcodeFillClass,
                                                                    ].join(' ')}
                                                                    style={{ width: `${transcodeProgress}%` }}
                                                                />
                                                            </div>
                                                            {transcodeLabel && (
                                                                <p className="text-[11px] text-muted-foreground">{transcodeLabel}</p>
                                                            )}
                                                        </div>
                                                    )}

                                                    {(episode.media ?? []).length > 0 ? (
                                                        <div className="space-y-2">
                                                            {(episode.media ?? []).map((media) => (
                                                                <div
                                                                    key={media.id}
                                                                    className="flex items-center justify-between rounded-md bg-muted/40 px-2 py-1.5 text-xs"
                                                                >
                                                                    <div className="truncate">
                                                                        {media.quality ?? 'default'}
                                                                        {media.language ? ` (${media.language})` : ''}
                                                                        {media.is_primary ? ' [default]' : ''}
                                                                    </div>
                                                                    <Button
                                                                        type="button"
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        onClick={() => deleteMedia(episode.id, media)}
                                                                        disabled={busy}
                                                                    >
                                                                        Remove
                                                                    </Button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <p className="text-xs text-muted-foreground">No media sources.</p>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
