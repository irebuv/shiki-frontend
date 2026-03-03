import {
    fetchAdminAnalyticsOverview,
    fetchAdminAnalyticsRealtime,
} from '@/api/admin/adminAnalyticsApi';
import { QueryState } from '@/components/custom/QueryState';
import { LoadingOverlay } from '@/components/shared/LoadingOverlay';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { AdminAnalyticsOverviewData, AdminAnalyticsRealtimeData } from '@/types/admin/analytics';
import { useCallback, useEffect, useMemo, useState } from 'react';

const DAY_OPTIONS = [1, 3, 7, 14, 30] as const;
type DayOption = (typeof DAY_OPTIONS)[number];
type MetricCardProps = {
    label: string;
    value: string;
};

type TopListRow = {
    label: string;
    value: string;
};

type TopListCardProps = {
    title: string;
    rows: TopListRow[];
};

function formatInt(value: number): string {
    return new Intl.NumberFormat('en-US').format(value);
}

function formatPercent(value: number): string {
    const normalized = value <= 1 ? value * 100 : value;
    return `${normalized.toFixed(1)}%`;
}

function formatDuration(seconds: number): string {
    const s = Math.max(0, Math.floor(seconds));
    const m = Math.floor(s / 60);
    const rest = s % 60;
    return `${m}:${String(rest).padStart(2, '0')}`;
}

function formatUpdatedAt(value?: string): string {
    if (!value) return '-';
    const ts = Date.parse(value);
    if (Number.isNaN(ts)) return '-';

    return new Intl.DateTimeFormat('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(new Date(ts));
}

function TopListCard({ title, rows }: TopListCardProps) {
    return (
        <div className="rounded-xl border border-border bg-background p-4 max-h-80 overflow-auto">
            <h3 className="text-base font-semibold text-foreground">{title}</h3>
            <div className="mt-3 space-y-2">
                {rows.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No data</p>
                ) : (
                    rows.map((row, index) => (
                        <div
                            key={`${row.label}-${index}`}
                            className="flex items-center justify-between gap-3"
                        >
                            <span className="truncate text-sm text-foreground/90">{row.label}</span>
                            <span className="shrink-0 text-sm font-medium text-foreground">
                                {row.value}
                            </span>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

function MetricCard({ label, value }: MetricCardProps) {
    return (
        <div className="rounded-xl border border-border bg-background p-4">
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="mt-1 text-2xl font-semibold text-foreground">{value}</p>
        </div>
    );
}

export default function AdminPanel() {
    const [period, setPeriod] = useState<DayOption>(14);
    const [data, setData] = useState<AdminAnalyticsOverviewData | null>(null);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<unknown>(null);

    const [realtimeOpen, setRealtimeOpen] = useState(false);
    const [realtimeData, setRealtimeData] = useState<AdminAnalyticsRealtimeData | null>(null);
    const [realtimeLoading, setRealtimeLoading] = useState(false);
    const [realtimeError, setRealtimeError] = useState<unknown>(null);

    const loadOverview = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetchAdminAnalyticsOverview(period);
            setData(response.data);
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    }, [period]);

    const loadRealtime = useCallback(async () => {
        setRealtimeLoading(true);
        setRealtimeError(null);

        try {
            const response = await fetchAdminAnalyticsRealtime();
            setRealtimeData(response.data);
        } catch (err) {
            setRealtimeError(err);
        } finally {
            setRealtimeLoading(false);
        }
    }, []);

    useEffect(() => {
        void loadOverview();
    }, [loadOverview]);

    useEffect(() => {
        if (!realtimeOpen) return;

        // Poll only while realtime panel is open
        void loadRealtime();
        const timer = window.setInterval(() => void loadRealtime(), 15000);

        return () => window.clearInterval(timer);
    }, [realtimeOpen, loadRealtime]);

    const updatedAtText = useMemo(() => formatUpdatedAt(data?.updated_at), [data?.updated_at]);

    const realtimeUpdatedAtText = useMemo(
        () => formatUpdatedAt(realtimeData?.updated_at),
        [realtimeData?.updated_at],
    );

    return (
        <QueryState
            error={error}
            loading={loading}
            onRetry={loadOverview}
            overlay={<LoadingOverlay />}
            className="flex min-h-full w-full flex-col gap-4"
        >
            <div className="flex flex-wrap items-center justify-between gap-3">
                <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
                <div className="flex items-center gap-2">
                    <Label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-border px-3 py-2 text-sm">
                        <input
                            type="checkbox"
                            checked={realtimeOpen}
                            onChange={(e) => setRealtimeOpen(e.target.checked)}
                            className="size-4 cursor-pointer"
                        />
                        Realtime panel
                    </Label>
                    <div className="w-40">
                        <Select
                            value={String(period)}
                            onValueChange={(value) => setPeriod(Number(value) as DayOption)}
                        >
                            <SelectTrigger className="cursor-pointer">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {DAY_OPTIONS.map((option) => (
                                    <SelectItem
                                        key={String(option)}
                                        value={String(option)}
                                        className="cursor-pointer"
                                    >
                                        {`Last ${option} days`}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <Button type="button" variant="outline" onClick={() => void loadOverview()}>
                        Refresh
                    </Button>
                </div>
            </div>

            <div
                className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${
                    realtimeOpen ? 'mb-2 grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                }`}
            >
                <div className="overflow-hidden rounded-xl shadow-md shadow-foreground/35">
                    <div className="bg-background p-4">
                        <div className="mb-3 flex items-center justify-between gap-2">
                            <h2 className="text-lg font-semibold text-foreground">
                                Realtime (last 30 minutes)
                            </h2>
                            <span className="text-xs text-muted-foreground">
                                Updated: {realtimeUpdatedAtText}
                            </span>
                        </div>
                        {realtimeLoading && !realtimeData ? (
                            <p className="text-sm text-muted-foreground">
                                Loading realtime data...
                            </p>
                        ) : realtimeError ? (
                            <div className="flex items-center justify-between gap-2 rounded-lg border border-destructive/30 bg-destructive/5">
                                <p className="text-sm text-destructive">
                                    Realtime data unavailable.
                                </p>
                                <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    onClick={() => void loadRealtime()}
                                >
                                    Retry
                                </Button>
                            </div>
                        ) : !realtimeData ? (
                            <p className="text-sm text-muted-foreground">No realtime data yet.</p>
                        ) : (
                            <>
                                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                                    <MetricCard
                                        label="Active users (30m)"
                                        value={formatInt(
                                            realtimeData.summary.active_users_last_30_min,
                                        )}
                                    />
                                    <MetricCard
                                        label="Views (30m)"
                                        value={formatInt(realtimeData.summary.views_last_30_min)}
                                    />
                                    <MetricCard
                                        label="Events (30m)"
                                        value={formatInt(realtimeData.summary.events_last_30_min)}
                                    />
                                </div>

                                <div className="mt-4 grid gap-4 lg:grid-cols-2">
                                    <TopListCard
                                        title="Top pages now"
                                        rows={realtimeData.top_pages.map((item) => ({
                                            label: item.path || '/',
                                            value: `${formatInt(item.users)} users`,
                                        }))}
                                    />
                                    <TopListCard
                                        title="Top locations now"
                                        rows={(realtimeData.top_locations ?? []).map((item) => ({
                                            label: item.location || 'Unknown',
                                            value: formatInt(item.users),
                                        }))}
                                    />
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            <div className="rounded-xl shadow-md shadow-foreground/35 p-4">
                {!data ? (
                    <div className="rounded-xl border border-border bg-background p-4 text-sm text-muted-foreground">
                        No analytics data yet.
                    </div>
                ) : (
                    <>
                        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                            <MetricCard
                                label="Active users"
                                value={formatInt(data.summary.active_users)}
                            />
                            <MetricCard
                                label="New users"
                                value={formatInt(data.summary.new_users)}
                            />
                            <MetricCard label="Sessions" value={formatInt(data.summary.sessions)} />
                            <MetricCard label="Views" value={formatInt(data.summary.views)} />
                            <MetricCard
                                label="Engagement"
                                value={formatPercent(data.summary.engagement_rate)}
                            />
                            <MetricCard
                                label="Avg session"
                                value={formatDuration(data.summary.avg_session_duration_sec)}
                            />
                        </div>

                        <div className="grid gap-4 lg:grid-cols-3 mt-3">
                            <TopListCard
                                title="Top pages"
                                rows={data.top_pages.map((item) => ({
                                    label: item.path || '/',
                                    value: formatInt(item.views),
                                }))}
                            />
                            <TopListCard
                                title="Top sources"
                                rows={data.top_sources.map((item) => ({
                                    label: item.source || '(direct) / (none)',
                                    value: formatInt(item.sessions),
                                }))}
                            />
                            <TopListCard
                                title="Top countries and cities"
                                rows={(data.top_locations ?? []).map((item) => ({
                                    label: item.location || 'Unknown',
                                    value: formatInt(item.users),
                                }))}
                            />
                        </div>

                        <div className="rounded-xl border border-border bg-background p-4 mt-3">
                            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                                <h2 className="text-lg font-semibold text-foreground">
                                    Daily trend
                                </h2>
                                <span className="text-xs text-muted-foreground">
                                    Updated: {updatedAtText}
                                </span>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="min-w-full text-sm">
                                    <thead>
                                        <tr className="text-left text-muted-foreground">
                                            <th className="px-2 py-1">Date</th>
                                            <th className="px-2 py-1">Active users</th>
                                            <th className="px-2 py-1">Views</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.timeseries.map((row) => (
                                            <tr key={row.date} className="border-t border-border">
                                                <td className="px-2 py-1">{row.date}</td>
                                                <td className="px-2 py-1">
                                                    {formatInt(row.active_users)}
                                                </td>
                                                <td className="px-2 py-1">
                                                    {formatInt(row.views)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </QueryState>
    );
}
