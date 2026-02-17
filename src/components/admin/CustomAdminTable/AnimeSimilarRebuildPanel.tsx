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
import { useCallback, useEffect, useState } from 'react';

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
    const [statusLoading, setStatusLoading] = useState(true);
    const [rebuildStatus, setRebuildStatus] = useState<RebuildStatusResponse['data'] | null>(null);
    const [scheduleOffPeak, setScheduleOffPeak] = useState(false);

    const isRunning = (rebuildStatus?.ready ?? 0) > 0;
    const pending = rebuildStatus?.pending ?? 0;
    const isBusy = pending > 0;

    const nextAvailableMs = rebuildStatus?.next_available_at
        ? Date.parse(rebuildStatus.next_available_at)
        : Number.NaN;

    const secondsToNext = Number.isFinite(nextAvailableMs)
        ? Math.max(0, Math.floor((nextAvailableMs - Date.now()) / 1000))
        : null;

    // Delayed queue may have short gaps with ready=0; treat near-future jobs as active.
    const isActiveQueue =
        isRunning || (isBusy && (secondsToNext === null || secondsToNext <= 120));

    const shouldFastPoll =
        open ||
        submitting ||
        isActiveQueue ||
        (isBusy && (secondsToNext === null || secondsToNext <= 600));

    const hasScheduled = (rebuildStatus?.scheduled ?? 0) > 0;
    const loadStatus = useCallback(async () => {
        try {
            const { data } = await api.get<RebuildStatusResponse>('/admin/anime/similars/status');
            setRebuildStatus(data?.data ?? null);
        } catch {
            //
        } finally {
            setStatusLoading(false);
        }
    }, []);

    const shouldPoll = open || submitting || isBusy || hasScheduled;
    const lockActions = statusLoading || submitting || clearingQueue || isActiveQueue;

    useEffect(() => {
        void loadStatus();

        if (!shouldPoll) return;

        const intervalMs = shouldFastPoll ? 5000 : 60000;
        const id = window.setInterval(() => void loadStatus(), intervalMs);
        return () => window.clearInterval(id);
    }, [shouldPoll, shouldFastPoll, loadStatus]);

    const submit = async () => {
        setSubmitting(true);
        setOpen(false);

        try {
            const { data } = await api.post<RebuildResponse>('/admin/anime/similars/rebuild', {
                scope,
                limit: 12,
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

    return (
        <>
            <div className="flex items-center gap-2 py-1.5 px-2 border rounded-xl">
               similars:
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => setOpen(true)}
                    disabled={lockActions}
                >
                    {statusLoading
                        ? 'Checking status...'
                        : isActiveQueue
                          ? 'Rebuild in progress...'
                          : isBusy
                            ? 'Rebuild queued...'
                            : submitting
                              ? 'Processing...'
                              : scheduleOffPeak
                                ? 'Schedule rebuild'
                                : 'Rebuild now'}
                </Button>
                <div className="text-xs text-muted-foreground">
                    {isRunning ? (
                        <span>
                            Rebuild in progress: {rebuildStatus?.ready ?? 0}
                            {rebuildStatus?.next_available_at
                                ? `, next: ${new Date(rebuildStatus.next_available_at).toLocaleTimeString()}`
                                : ''}
                        </span>
                    ) : isActiveQueue ? (
                        <span>
                            Queue active: {rebuildStatus?.pending ?? 0}
                            {rebuildStatus?.next_available_at
                                ? `, next: ${new Date(rebuildStatus.next_available_at).toLocaleTimeString()}`
                                : ''}
                        </span>
                    ) : hasScheduled ? (
                        <span>
                            Scheduled: {rebuildStatus?.scheduled ?? 0}
                            {rebuildStatus?.next_available_at
                                ? `, next: ${new Date(rebuildStatus.next_available_at).toLocaleTimeString()}`
                                : ''}
                        </span>
                    ) : (
                        <span>
                            {statusLoading ? 'Checking rebuild queue...' : 'Rebuild queue is idle'}
                        </span>
                    )}
                    {rebuildStatus?.failed ? (
                        <span className="ml-2 text-danger">Failed: {rebuildStatus.failed}</span>
                    ) : null}
                    {isBusy || (rebuildStatus?.failed ?? 0) > 0 ? (
                        <Button
                            type="button"
                            variant="clear"
                            onClick={clearQueue}
                            disabled={statusLoading || submitting || clearingQueue}
                            className="ml-2"
                        >
                            {clearingQueue ? 'Clearing...' : 'Clear queue'}
                        </Button>
                    ) : null}
                </div>
            </div>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-xl">
                    <DialogHeader>
                        <DialogTitle>Rebuild Similar Anime</DialogTitle>
                        <DialogDescription>
                            Queue recalculation now or schedule it for off-peak hours at next 03:30.
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
                    </div>
                    <div className="space-y-3">
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
                        <Button type="button" onClick={submit} disabled={lockActions}>
                            {statusLoading
                                ? 'Checking status...'
                                : isActiveQueue
                                  ? 'Rebuild in progress...'
                                  : isBusy
                                    ? 'Rebuild queued...'
                                    : submitting
                                      ? 'Processing...'
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
