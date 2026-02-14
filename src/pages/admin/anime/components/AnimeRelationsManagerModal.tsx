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
import { useCallback, useEffect, useMemo, useState } from 'react';

type AnimeRef = {
    id: number;
    name?: string;
};

type AnimeRelationsManagerModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    anime: AnimeRef | null;
};

type RelationCandidate = {
    id: number;
    name: string;
    slug?: string | null;
    season_year?: number | null;
    season?: string | null;
    type?: string | null;
    status?: string | null;
    relation_group?: {
        id: number;
        group_key?: string | null;
        anchor_anime?: {
            id: number;
            name: string;
            slug?: string | null;
        } | null;
    } | null;
    is_in_other_group?: boolean;
};

type RelationItem = {
    id?: number | null;
    related_anime_id: number;
    sort_order: number;
    group_id?: number;
    is_current?: boolean;
    related_anime?: RelationCandidate | null;
};

type RelationsResponse = {
    relations?: RelationItem[];
};

type RelationCandidatesResponse = {
    items?: RelationCandidate[];
};

type RelationMutationResponse = {
    message?: string;
    relation?: RelationItem;
};

const toIntOrNull = (value: string) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? Math.trunc(parsed) : null;
};

const shorten = (value: string, max = 72) =>
    value.length > max ? `${value.slice(0, Math.max(0, max - 3))}...` : value;

const sortByOrderAndName = (items: RelationItem[]) => {
    return [...items].sort((a, b) => {
        const aOrder = Number.isFinite(a.sort_order) ? a.sort_order : 0;
        const bOrder = Number.isFinite(b.sort_order) ? b.sort_order : 0;
        if (aOrder !== bOrder) return aOrder - bOrder;

        const aName = String(a.related_anime?.name ?? '').toLowerCase();
        const bName = String(b.related_anime?.name ?? '').toLowerCase();
        return aName.localeCompare(bName);
    });
};

export function AnimeRelationsManagerModal({ open, onOpenChange, anime }: AnimeRelationsManagerModalProps) {
    const [loading, setLoading] = useState(false);
    const [busy, setBusy] = useState(false);
    const [relations, setRelations] = useState<RelationItem[]>([]);

    const [searchQuery, setSearchQuery] = useState('');
    const [candidatesLoading, setCandidatesLoading] = useState(false);
    const [candidates, setCandidates] = useState<RelationCandidate[]>([]);
    const [selectedCandidateId, setSelectedCandidateId] = useState('');

    const loadRelations = useCallback(async () => {
        if (!anime?.id || !open) return;
        setLoading(true);
        try {
            const res = await api.get<RelationsResponse>(`/admin/anime/${anime.id}/relations`);
            setRelations(Array.isArray(res.data.relations) ? res.data.relations : []);
        } catch {
            setRelations([]);
            toast.error('Failed to load relations.');
        } finally {
            setLoading(false);
        }
    }, [anime?.id, open]);

    const loadCandidates = useCallback(
        async (query: string) => {
            if (!anime?.id || !open) return;
            setCandidatesLoading(true);
            try {
                const res = await api.get<RelationCandidatesResponse>(
                    `/admin/anime/${anime.id}/relations/candidates`,
                    {
                        params: {
                            q: query.trim() || undefined,
                            limit: 50,
                        },
                    },
                );
                setCandidates(Array.isArray(res.data.items) ? res.data.items : []);
            } catch {
                setCandidates([]);
            } finally {
                setCandidatesLoading(false);
            }
        },
        [anime?.id, open],
    );

    useEffect(() => {
        if (!open || !anime?.id) return;
        void loadRelations();
        void loadCandidates('');
    }, [open, anime?.id, loadCandidates, loadRelations]);

    useEffect(() => {
        if (!open || !anime?.id) return;
        const timer = setTimeout(() => {
            void loadCandidates(searchQuery);
        }, 300);
        return () => clearTimeout(timer);
    }, [open, anime?.id, searchQuery, loadCandidates]);

    useEffect(() => {
        if (open) return;
        setRelations([]);
        setSearchQuery('');
        setCandidates([]);
        setSelectedCandidateId('');
    }, [open]);

    const sortedRelations = useMemo(
        () => sortByOrderAndName(relations),
        [relations],
    );

    const relatedIds = useMemo(
        () => new Set(sortedRelations.map((item) => Number(item.related_anime_id)).filter((id) => id > 0)),
        [sortedRelations],
    );

    const filteredCandidates = useMemo(
        () => candidates.filter((item) => !relatedIds.has(item.id)),
        [candidates, relatedIds],
    );

    const selectedCandidate = useMemo(
        () => filteredCandidates.find((item) => String(item.id) === selectedCandidateId) ?? null,
        [filteredCandidates, selectedCandidateId],
    );
    const sourceHasGroup = sortedRelations.length > 0;
    const blockedByOtherGroup = !!selectedCandidate?.is_in_other_group && sourceHasGroup;

    useEffect(() => {
        if (!selectedCandidateId) return;
        const exists = filteredCandidates.some((item) => String(item.id) === selectedCandidateId);
        if (!exists) setSelectedCandidateId('');
    }, [filteredCandidates, selectedCandidateId]);

    const addRelation = async () => {
        if (!anime?.id) return;

        const relatedAnimeId = toIntOrNull(selectedCandidateId);
        if (!relatedAnimeId || relatedAnimeId <= 0) {
            toast.error('Select an anime first.');
            return;
        }

        setBusy(true);
        try {
            const res = await api.post<RelationMutationResponse>(`/admin/anime/${anime.id}/relations`, {
                related_anime_id: relatedAnimeId,
            });
            if (res.data.message) toast.success(res.data.message);
            setSelectedCandidateId('');
            await loadRelations();
        } catch (error: any) {
            const message = String(error?.response?.data?.message ?? '').trim();
            toast.error(message || 'Failed to add relation.');
        } finally {
            setBusy(false);
        }
    };

    const moveRelation = async (relatedAnimeId: number, direction: -1 | 1) => {
        if (!anime?.id) return;

        const index = sortedRelations.findIndex((item) => item.related_anime_id === relatedAnimeId);
        if (index < 0) return;

        const targetIndex = index + direction;
        if (targetIndex < 0 || targetIndex >= sortedRelations.length) return;

        const orderedRelatedIds = sortedRelations.map((item) => Number(item.related_anime_id));
        const [movedId] = orderedRelatedIds.splice(index, 1);
        orderedRelatedIds.splice(targetIndex, 0, movedId);

        setBusy(true);
        try {
            await api.post(`/admin/anime/${anime.id}/relations/reorder`, {
                related_ids: orderedRelatedIds,
            });
            await loadRelations();
        } catch (error: any) {
            const message = String(error?.response?.data?.message ?? '').trim();
            toast.error(message || 'Failed to move relation.');
        } finally {
            setBusy(false);
        }
    };

    const deleteRelation = async (relationId: number | null | undefined) => {
        if (!relationId || !anime?.id) return;
        const confirmed = window.confirm('Delete this relation?');
        if (!confirmed) return;

        setBusy(true);
        try {
            const res = await api.delete(`/admin/anime/${anime.id}/relations/${relationId}`);
            const message = String(res?.data?.message ?? '').trim();
            if (message !== '') toast.success(message);
            await loadRelations();
        } catch (error: any) {
            const message = String(error?.response?.data?.message ?? '').trim();
            toast.error(message || 'Failed to delete relation.');
        } finally {
            setBusy(false);
        }
    };

    const detachCurrentFromGroup = async () => {
        if (!anime?.id) return;
        const confirmed = window.confirm('Remove current anime from this relations group?');
        if (!confirmed) return;

        setBusy(true);
        try {
            const res = await api.delete(`/admin/anime/${anime.id}/relations/current`);
            const message = String(res?.data?.message ?? '').trim();
            if (message !== '') toast.success(message);
            await loadRelations();
        } catch (error: any) {
            const message = String(error?.response?.data?.message ?? '').trim();
            toast.error(message || 'Failed to remove anime from group.');
        } finally {
            setBusy(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="w-[96vw] max-h-[92vh] overflow-hidden p-0 sm:max-w-6xl">
                <DialogHeader className="border-b px-6 py-4">
                    <DialogTitle>Relations Manager</DialogTitle>
                    <DialogDescription>
                        Anime: {anime?.name ?? '-'} (ID: {anime?.id ?? '-'})
                    </DialogDescription>
                </DialogHeader>

                <div className="grid min-h-0 gap-4 p-4 lg:grid-cols-[360px_minmax(0,1fr)]">
                    <section className="min-h-0 rounded-2xl border bg-background p-4">
                        <div className="mb-3">
                            <h4 className="text-sm font-semibold">Add candidate</h4>
                            <p className="text-xs text-muted-foreground">
                                Add anime to the shared relations group.
                            </p>
                        </div>

                        <div className="space-y-3">
                            <div className="space-y-2">
                                <Label htmlFor="relation-search">Search anime</Label>
                                <Input
                                    id="relation-search"
                                    value={searchQuery}
                                    onChange={(event) => setSearchQuery(event.target.value)}
                                    placeholder="Type anime name..."
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Results</Label>
                                <div className="rounded-xl border bg-muted/10">
                                    <div className="max-h-64 overflow-y-auto">
                                        {candidatesLoading ? (
                                            <p className="px-3 py-2 text-sm text-muted-foreground">Loading...</p>
                                        ) : filteredCandidates.length === 0 ? (
                                            <p className="px-3 py-2 text-sm text-muted-foreground">
                                                {candidates.length === 0
                                                    ? 'No candidates found.'
                                                    : 'All found titles are already in this relations group.'}
                                            </p>
                                        ) : (
                                            <ul className="divide-y">
                                                {filteredCandidates.map((item) => {
                                                    const selected = String(item.id) === selectedCandidateId;
                                                    return (
                                                        <li key={item.id}>
                                                            <button
                                                                type="button"
                                                                className={[
                                                                    'w-full px-3 py-2 text-left transition-colors',
                                                                    selected
                                                                        ? 'bg-primary/12 text-primary'
                                                                        : 'hover:bg-muted/40',
                                                                ].join(' ')}
                                                                onClick={() => setSelectedCandidateId(String(item.id))}
                                                            >
                                                                <p className="line-clamp-2 text-sm font-medium">
                                                                    {shorten(`${item.name} (#${item.id})`, 70)}
                                                                </p>
                                                                <p className="text-xs text-muted-foreground">
                                                                    {item.type ?? '-'} {item.season ?? '-'} {item.season_year ?? '-'}
                                                                </p>
                                                                {item.is_in_other_group && item.relation_group && (
                                                                    <p className="text-xs text-amber-700">
                                                                        In group #{item.relation_group.id}
                                                                        {item.relation_group.anchor_anime?.name
                                                                            ? ` with ${shorten(item.relation_group.anchor_anime.name, 36)}`
                                                                            : ''}
                                                                    </p>
                                                                )}
                                                            </button>
                                                        </li>
                                                    );
                                                })}
                                            </ul>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-md bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
                                {selectedCandidate
                                    ? blockedByOtherGroup
                                        ? `Selected: ${selectedCandidate.name} (#${selectedCandidate.id}) is already in another group. Open that group to manage links.`
                                        : `Selected: ${selectedCandidate.name} (#${selectedCandidate.id})`
                                    : 'No candidate selected.'}
                            </div>

                            <Button
                                type="button"
                                className="w-full"
                                onClick={addRelation}
                                disabled={busy || !selectedCandidate || blockedByOtherGroup}
                            >
                                Add to relations
                            </Button>
                        </div>
                    </section>

                    <section className="min-h-0 rounded-2xl border bg-background p-4">
                        <div className="mb-3 flex items-center justify-between gap-2">
                            <div>
                                <h4 className="text-sm font-semibold">Shared relations list</h4>
                                <p className="text-xs text-muted-foreground">Total: {sortedRelations.length}</p>
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    void loadRelations();
                                }}
                                disabled={loading || busy}
                            >
                                Refresh
                            </Button>
                        </div>

                        {loading ? (
                            <p className="text-sm text-muted-foreground">Loading...</p>
                        ) : sortedRelations.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No relations yet.</p>
                        ) : (
                            <div className="max-h-[58vh] space-y-3 overflow-y-auto pr-1">
                                {sortedRelations.map((relation, index) => {
                                    const relationId =
                                        typeof relation.id === 'number' && relation.id > 0 ? relation.id : null;
                                    const isCurrent = relation.is_current === true;
                                    return (
                                        <div
                                            key={`relation-${relation.related_anime_id}`}
                                            className="rounded-xl border bg-background/80 p-3"
                                        >
                                            <div className="mb-2 flex items-start justify-between gap-2">
                                                <div className="min-w-0">
                                                    <p className="truncate text-sm font-medium">
                                                        {relation.related_anime?.name ?? `Anime #${relation.related_anime_id}`}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {relation.related_anime?.type ?? '-'} {relation.related_anime?.season ?? '-'}{' '}
                                                        {relation.related_anime?.season_year ?? '-'}
                                                    </p>
                                                </div>
                                                <div className="flex shrink-0 items-center gap-1">
                                                    <span className="rounded bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
                                                        #{index + 1}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="grid gap-2 sm:grid-cols-3">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => {
                                                        void moveRelation(relation.related_anime_id, -1);
                                                    }}
                                                    disabled={busy || index === 0}
                                                >
                                                    Up
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => {
                                                        void moveRelation(relation.related_anime_id, 1);
                                                    }}
                                                    disabled={busy || index === sortedRelations.length - 1}
                                                >
                                                    Down
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => {
                                                        if (isCurrent) {
                                                            void detachCurrentFromGroup();
                                                            return;
                                                        }

                                                        void deleteRelation(relationId);
                                                    }}
                                                    disabled={busy || (!isCurrent && relationId === null)}
                                                    title={
                                                        !isCurrent && relationId === null
                                                            ? 'Remove a direct link from the source title first.'
                                                            : undefined
                                                    }
                                                >
                                                    Delete
                                                </Button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </section>
                </div>
            </DialogContent>
        </Dialog>
    );
}
