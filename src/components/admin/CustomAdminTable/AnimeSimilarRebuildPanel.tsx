import api from '@/api/axios';
import { toast } from '@/components/custom/Sonner';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

type Scope = 'all' | 'week' | 'month' | 'two_months' | 'three_months';

const scopeOptions: { value: Scope; label: string }[] = [
    { value: 'all', label: 'All (no exclusions)' },
    { value: 'week', label: 'Older than 1 week' },
    { value: 'month', label: 'Older than 1 month' },
    { value: 'two_months', label: 'Older than 2 months' },
    { value: 'three_months', label: 'Older than 3 months' },
];

type RebuildResponse = {
    message: string;
    data?: {
        queued?: number;
        scope?: Scope;
        limit?: number;
        chunk?: number;
    };
    errors?: unknown;
};

type ClearQueueResponse = {
    message: string;
    data?: {
        queued_deleted?: number;
        failed_deleted?: number;
    };
    errors?: unknown;
};

type RebuildStatusResponse = {
    message: string;
    data?: {
        status: 'idle' | 'running' | 'scheduled';
        ready: number;
        scheduled: number;
        pending: number;
        failed: number;
        next_available_at: string | null;
        limit?: number;
    };
    errors?: unknown;
};

type SimilarSettingsResponse = {
    message: string;
    data?: {
        limit: number;
        min: number;
        max: number;
        step: number;
    };
    errors?: unknown;
};

type Props = {
    onDone?: () => void;
};

export function AnimeSimilarRebuildPanel({ onDone }: Props) {
    const [open, setOpen] = useState(false);
    const [scope, setScope] = useState<Scope>('three_months');
    const [submitting, setSubmitting] = useState(false);
    const [clearingQueue, setClearingQueue] = useState(false);
    const [settingsLoading, setSettingsLoading] = useState(true);
    const [statusLoading, setStatusLoading] = useState(true);
    const [rebuildStatus, setRebuildStatus] = useState<RebuildStatusResponse['data'] | null>(null);
    const [scheduleOffPeak, setScheduleOffPeak] = useState(false);
    const [limitSaving, setLimitSaving] = useState(false);

    const [settingsOpen, setSettingsOpen] = useState(false);
    const [similarLimit, setSimilarLimit] = useState(12);
    const [limitDraft, setLimitDraft] = useState('12');

    const [limitMin, setLimitMin] = useState(4);
    const [limitMax, setLimitMax] = useState(24);
    const [limitStep, setLimitStep] = useState(4);

    const settingsRef = useRef<HTMLDivElement | null>(null);

    const isRunning = (rebuildStatus?.ready ?? 0) > 0;
    const pending = rebuildStatus?.pending ?? 0;
    const isBusy = pending > 0;
    const hasScheduled = (rebuildStatus?.scheduled ?? 0) > 0;

    const nextAvailableMs = rebuildStatus?.next_available_at
        ? Date.parse(rebuildStatus.next_available_at)
        : Number.NaN;

    const secondsToNext = Number.isFinite(nextAvailableMs)
        ? Math.max(0, Math.floor((nextAvailableMs - Date.now()) / 1000))
        : null;

    // Delayed queue may have short gaps with ready=0; treat near-future jobs as active.
    const isActiveQueue = isRunning || (isBusy && (secondsToNext === null || secondsToNext <= 120));

    const shouldFastPoll =
        open ||
        submitting ||
        isActiveQueue ||
        (isBusy && (secondsToNext === null || secondsToNext <= 600));

    const shouldPoll = open || submitting || isBusy || hasScheduled;
    const lockRebuildActions =
        statusLoading ||
        settingsLoading ||
        submitting ||
        clearingQueue ||
        isActiveQueue ||
        hasScheduled;
    const lockSettingsActions =
        settingsLoading || limitSaving || submitting || clearingQueue || isActiveQueue;

    const loadStatus = useCallback(async () => {
        try {
            const { data } = await api.get<RebuildStatusResponse>('/admin/anime/similars/status');
            setRebuildStatus(data?.data ?? null);

            if (typeof data?.data?.limit === 'number') {
                setSimilarLimit(data.data.limit);
                setLimitDraft(String(data.data.limit));
            }
        } finally {
            setStatusLoading(false);
        }
    }, []);

    const loadSettings = useCallback(async () => {
        try {
            const { data } = await api.get<SimilarSettingsResponse>(
                '/admin/anime/similars/settings',
            );
            if (data?.data) {
                setSimilarLimit(data.data.limit);
                setLimitDraft(String(data.data.limit));
                setLimitMin(data.data.min);
                setLimitMax(data.data.max);
                setLimitStep(data.data.step);
            }
        } finally {
            setSettingsLoading(false);
        }
    }, []);

    useEffect(() => {
        void loadStatus();
        void loadSettings();
    }, [loadStatus, loadSettings]);

    useEffect(() => {
        if (!shouldPoll) return;

        const intervalMs = shouldFastPoll ? 5000 : 60000;
        const id = window.setInterval(() => void loadStatus(), intervalMs);
        return () => window.clearInterval(id);
    }, [shouldPoll, shouldFastPoll, loadStatus]);

    useEffect(() => {
        if (!settingsOpen) return;

        const onPointerDown = (event: MouseEvent) => {
            const target = event.target as HTMLElement | null;
            if (!target) return;

            // Radix Select renders options in portal, treat it as inside this popup.
            if (target.closest('[data-slot="select-content"]')) return;

            if (!settingsRef.current) return;
            if (settingsRef.current.contains(target)) return;

            setSettingsOpen(false);
        };

        document.addEventListener('mousedown', onPointerDown);
        return () => document.removeEventListener('mousedown', onPointerDown);
    }, [settingsOpen]);

    const statusText = useMemo(() => {
        if (statusLoading) return 'Checking rebuild queue ...';
        if (isRunning) {
            return `Running: ${rebuildStatus?.ready ?? 0}`;
        }

        if (isActiveQueue) {
            return `Queue active: ${rebuildStatus?.pending ?? 0}`;
        }

        if (hasScheduled) {
            return `Scheduled: ${rebuildStatus?.scheduled ?? 0}`;
        }

        return 'Rebuild queue is idle';
    }, [
        statusLoading,
        isRunning,
        isActiveQueue,
        hasScheduled,
        rebuildStatus?.ready,
        rebuildStatus?.pending,
        rebuildStatus?.scheduled,
    ]);

    const nextText = useMemo(() => {
        if (!rebuildStatus?.next_available_at) return '';
        return `next: ${new Date(rebuildStatus.next_available_at).toLocaleTimeString()}`;
    }, [rebuildStatus?.next_available_at]);

    const limitOptions = useMemo(() => {
        const options: number[] = [];
        for (let v = limitMin; v <= limitMax; v += limitStep) {
            options.push(v);
        }
        return options;
    }, [limitMin, limitMax, limitStep]);

    const submit = async () => {
        setSubmitting(true);
        setOpen(false);

        try {
            const { data } = await api.post<RebuildResponse>('/admin/anime/similars/rebuild', {
                scope,
                chunk: 200,
                defer_to_night: scheduleOffPeak,
            });

            toast.success(
                data?.message ?? (scheduleOffPeak ? 'Rebuild scheduled' : 'Rebuild completed'),
            );
            onDone?.();
        } finally {
            setSubmitting(false);
            await loadStatus();
        }
    };

    const clearQueue = async () => {
        if (!window.confirm('Clear queued similar rebuild jobs?')) {
            return;
        }

        setClearingQueue(true);

        try {
            const { data } = await api.delete<ClearQueueResponse>('/admin/anime/similars/queue', {
                data: { clear_failed: true },
            });
            toast.success(data?.message ?? 'Queue cleared');
        } finally {
            setClearingQueue(false);
            await loadStatus();
        }
    };

    const saveLimit = async () => {
        const parsed = Number(limitDraft);

        if (!Number.isInteger(parsed)) {
            toast.error('Limit must be an integer');
            return;
        }

        if (parsed < limitMin || parsed > limitMax) {
            toast.error(`Limit must be between ${limitMin} and ${limitMax}`);
            return;
        }

        if (parsed % limitStep !== 0) {
            toast.error(`Limit must be a multiple of ${limitStep}`);
            return;
        }

        setLimitSaving(true);

        try {
            const { data } = await api.put<SimilarSettingsResponse>(
                '/admin/anime/similars/settings',
                { limit: parsed },
            );

            const nextLimit = data?.data?.limit ?? parsed;
            setSimilarLimit(nextLimit);
            setLimitDraft(String(nextLimit));
            toast.success(data?.message ?? 'Similar limit updated');
            setSettingsOpen(false);
            await loadStatus();
        } finally {
            setLimitSaving(false);
        }
    };

    return (
        <>
            <div className="relative flex flex-wrap items-center gap-2 border rounded-xl py-1.5 px-2">
                <span className="text-sm font-semibold text-foreground">similars:</span>

                <Button
                    type="button"
                    variant="outline"
                    onClick={() => setOpen(true)}
                    disabled={lockRebuildActions}
                >
                    {statusLoading
                        ? 'Checking status...'
                        : isActiveQueue
                          ? 'Rebuild in progress...'
                          : isBusy
                            ? 'Rebuild queued...'
                            : scheduleOffPeak
                              ? 'Schedule rebuild'
                              : 'Rebuild now'}
                </Button>

                <div ref={settingsRef} className="relative">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => setSettingsOpen((v) => !v)}
                        disabled={lockSettingsActions}
                    >
                        Limit: {similarLimit}
                    </Button>

                    {settingsOpen ? (
                        <div className="absolute left-0 top-[calc(100%+8px)] z-50 w-72 rounded-xl border border-border bg-background p-3 shadow-lg">
                            <p className="text-xs text-muted-foreground">
                                Global similar limit for all rebuilds and anime detail output.
                            </p>
                            <div className="rounded-lg border border-danger/30 bg-danger/10 p-3 text-xs text-foreground">
                                Be careful to increase this value too high. It can load database and
                                made overwhelmed.
                            </div>
                            <div className="mt-2 space-y-2">
                                <Label htmlFor="similar-limit-input">Similar limit</Label>

                                <Select
                                    value={limitDraft}
                                    onValueChange={setLimitDraft}
                                    disabled={limitSaving}
                                >
                                    <SelectTrigger id="similar-limit-input">
                                        <SelectValue placeholder="Select limit" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {limitOptions.map((value) => (
                                            <SelectItem key={value} value={String(value)}>
                                                {value}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <p className="text-xs text-muted-foreground">
                                    Allowed: {limitMin}..{limitMax}, step: {limitStep}
                                </p>
                            </div>

                            <div className="mt-3 flex items-center justify-end gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        setLimitDraft(String(similarLimit));
                                        setSettingsOpen(false);
                                    }}
                                    disabled={limitSaving}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="button"
                                    size="sm"
                                    onClick={saveLimit}
                                    disabled={limitSaving}
                                >
                                    {limitSaving ? 'Saving...' : 'Save'}
                                </Button>
                            </div>
                        </div>
                    ) : null}
                </div>

                <span className="text-xs text-muted-foreground">
                    {statusText}
                    {nextText ? `, ${nextText}` : ''}
                    {rebuildStatus?.failed ? `, failed: ${rebuildStatus.failed}` : ''}
                </span>

                {isBusy || (rebuildStatus?.failed ?? 0) > 0 ? (
                    <Button
                        type="button"
                        variant="clear"
                        onClick={clearQueue}
                        disabled={statusLoading || clearingQueue || submitting}
                    >
                        {clearingQueue ? 'Clearing...' : 'Clear queue'}
                    </Button>
                ) : null}
            </div>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-xl">
                    <DialogHeader>
                        <DialogTitle>Rebuild Similar Anime</DialogTitle>
                        <DialogDescription>
                            Uses global limit: {similarLimit}. Queue now or schedule for next 03:30.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-3">
                        <div className="rounded-lg border border-danger/30 bg-danger/10 p-3 text-xs text-foreground">
                            Large rebuilds can significantly load CPU/DB. Use off-peak scheduling
                            for safer runs.
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="rebuild-scope">Rebuild scope</Label>
                            <Select value={scope} onValueChange={(v) => setScope(v as Scope)}>
                                <SelectTrigger id="rebuild-scope">
                                    <SelectValue placeholder="Select scope" />
                                </SelectTrigger>
                                <SelectContent>
                                    {scopeOptions.map((opt) => (
                                        <SelectItem key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <label className="flex items-center gap-2 text-sm cursor-pointer">
                            <input
                                type="checkbox"
                                className="h-4 w-4 cursor-pointer"
                                checked={scheduleOffPeak}
                                onChange={(e) => setScheduleOffPeak(e.target.checked)}
                                disabled={submitting}
                            />
                            Schedule for off-peak (next 03:30)
                        </label>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="button" onClick={submit} disabled={lockRebuildActions}>
                            {statusLoading
                                ? 'Checking status...'
                                : isActiveQueue
                                  ? 'Rebuild in progress...'
                                  : scheduleOffPeak
                                    ? 'Schedule rebuild'
                                    : 'Rebuild now'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
