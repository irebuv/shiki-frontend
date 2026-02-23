import { fetchAdminAnalyticsOverview } from '@/api/admin/adminAnalyticsApi';
import { QueryState } from '@/components/custom/QueryState';
import { LoadingOverlay } from '@/components/shared/LoadingOverlay';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { AdminAnalyticsOverviewData } from '@/types/admin/analytics';
import { useCallback, useEffect, useMemo, useState } from 'react';

const DAY_OPTIONS = [7, 14, 30] as const;
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

function TopListCard({ title, rows }: TopListCardProps) {
    return (
        <div className="rounded-xl border border-border bg-background p-4">
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
    const [days, setDays] = useState<DayOption>(14);
    const [data, setData] = useState<AdminAnalyticsOverviewData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<unknown>(null);

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetchAdminAnalyticsOverview(days);
            setData(response.data);
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    }, [days]);

    useEffect(() => {
        void load();
    }, [load]);

    const updatedAtText = useMemo(() => {
        if (!data?.updated_at) return '-';
        const ts = Date.parse(data.updated_at);
        if (Number.isNaN(ts)) return '-';
        return new Intl.DateTimeFormat('en-EN', {
            dateStyle: 'medium',
            timeStyle: 'short',
        }).format(new Date(ts));
    }, [data?.updated_at]);

    return (
        <QueryState
            error={error}
            loading={loading}
            onRetry={load}
            overlay={<LoadingOverlay />}
            className="flex size-full flex-col gap-4"
        >
            <div className="flex flex-wrap items-center justify-between gap-3">
                <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
                <div className="flex items-center gap-2">
                    <div className="w-40">
                        <Select
                            value={String(days)}
                            onValueChange={(value) => setDays(Number(value) as DayOption)}
                        >
                            <SelectTrigger className="cursor-pointer">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {DAY_OPTIONS.map((d) => (
                                    <SelectItem
                                        key={d}
                                        value={String(d)}
                                        className="cursor-pointer"
                                    >
                                        Last {d} days
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <Button type="button" variant="outline" onClick={() => void load()}>
                        Refresh
                    </Button>
                </div>
            </div>
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
                        <MetricCard label="New users" value={formatInt(data.summary.new_users)} />
                        <MetricCard label="Sessions" value={formatInt(data.summary.sessions)} />
                        <MetricCard label="Views" value={formatInt(data.summary.views)} />
                        <MetricCard
                            label="Engagement"
                            value={formatInt(data.summary.engagement_rate)}
                        />
                        <MetricCard
                            label="Avg session"
                            value={formatDuration(data.summary.avg_session_duration_sec)}
                        />
                    </div>

                    <div className="grid gap-4 lg:grid-cols-3">
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
                            title="Top countries"
                            rows={data.top_countries.map((item) => ({
                                label: item.country || 'Unknown',
                                value: formatInt(item.users),
                            }))}
                        />
                    </div>

                    <div className="rounded-xl border border-border bg-background p-4">
                        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                            <h2 className="text-lg font-semibold text-foreground">Daily trend</h2>
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
                                            <td className="px-2 py-1">{formatInt(row.active_users)}</td>
                                            <td className="px-2 py-1">{formatInt(row.views)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}
        </QueryState>
    );
}
