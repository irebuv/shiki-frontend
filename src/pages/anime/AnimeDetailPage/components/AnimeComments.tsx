import { createAnimeComment, fetchAnimeComments, voteAnimeComment } from '@/api/commentApi';
import { toast } from '@/components/custom/Sonner';
import { LoadingOverlay } from '@/components/shared/LoadingOverlay';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/context/AuthContext';
import { imageUrl } from '@/lib/imageUrl';
import { cn } from '@/lib/utils';
import { AnimeCommentItem, AnimeCommentUser, CommentSort, CommentVoteValue } from '@/types/comment';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

type Props = {
    animeId?: number;
    slug?: string;
};

type ReplyState = {
    parentId: number;
    targetCommentId: number;
    replyToUserId: number | null;
    replyToName: string;
};

const PER_PAGE = 10;

function getErrorMessage(error: unknown, fallback: string): string {
    if (typeof error === 'object' && error !== null) {
        const withResponse = error as { response?: { data?: { message?: string } } };
        const msg = withResponse.response?.data?.message;
        if (typeof msg === 'string' && msg.trim() !== '') {
            return msg;
        }
    }
    return fallback;
}

function resolveAvatarUrl(user: AnimeCommentUser): string | undefined {
    if (user.avatar_path && user.avatar_path.trim() !== '') {
        return imageUrl(user.avatar_path);
    }
    return undefined;
}

function updateCommentInTree(
    items: AnimeCommentItem[],
    updated: AnimeCommentItem,
): AnimeCommentItem[] {
    return items.map((root) => {
        if (root.id === updated.id) {
            return {
                ...root,
                ...updated,
                replies: root.replies,
            };
        }

        return {
            ...root,
            replies: root.replies.map((reply) =>
                reply.id === updated.id
                    ? {
                          ...reply,
                          ...updated,
                          replies: [],
                      }
                    : reply,
            ),
        };
    });
}

function insertCreatedComment(
    items: AnimeCommentItem[],
    created: AnimeCommentItem,
    sort: CommentSort,
): AnimeCommentItem[] {
    // Root comment.
    if (created.parent_id === null) {
        if (sort === 'new') {
            return [created, ...items];
        }
        return items;
    }

    // One-level reply comment.
    return items.map((root) => {
        if (root.id !== created.parent_id) {
            return root;
        }

        const exists = root.replies.some((reply) => reply.id === created.id);
        if (exists) {
            return root;
        }

        return {
            ...root,
            replies_count: root.replies_count + 1,
            replies: [...root.replies, created],
        };
    });
}

export default function AnimeComments({ animeId, slug }: Props) {
    const { user } = useAuth();

    const [items, setItems] = useState<AnimeCommentItem[]>([]);
    const [sort, setSort] = useState<CommentSort>('new');
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);

    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);

    const [draft, setDraft] = useState('');
    const [hasSpoiler, setHasSpoiler] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const [replyState, setReplyState] = useState<ReplyState | null>(null);
    const [revealedSpoilers, setRevealedSpoilers] = useState<Record<number, boolean>>({});
    const [votePending, setVotePending] = useState<Record<number, boolean>>({});

    const [errorText, setErrorText] = useState<string | null>(null);

    const [showJumpToFirst, setShowJumpToFirst] = useState(false);
    const commentsBlockRef = useRef<HTMLDivElement | null>(null);

    const dateFormatter = useMemo(
        () =>
            new Intl.DateTimeFormat('en-EN', {
                dateStyle: 'medium',
                timeStyle: 'short',
            }),
        [],
    );

    // useCallback
    const formatDate = useCallback(
        (value: string | null) => {
            if (!value) return '';
            const timestamp = Date.parse(value);
            if (Number.isNaN(timestamp)) return '';
            return dateFormatter.format(new Date(timestamp));
        },
        [dateFormatter],
    );

    const loadPage = useCallback(
        async (targetPage: number, append: boolean, nextSort: CommentSort) => {
            if (!slug) return;

            if (append) {
                setLoadingMore(true);
            } else {
                setLoading(true);
            }

            try {
                setErrorText(null);

                const response = await fetchAnimeComments({
                    slug,
                    page: targetPage,
                    perPage: PER_PAGE,
                    sort: nextSort,
                });

                const payload = response.data;
                const nextItems = payload?.items ?? [];

                setItems((prev) => (append ? [...prev, ...nextItems] : nextItems));
                setPage(payload?.pagination.current_page ?? targetPage);
                setHasMore(Boolean(payload?.pagination.has_more));
            } catch (error) {
                setErrorText(getErrorMessage(error, 'Failed to load comments.'));
            } finally {
                if (append) {
                    setLoadingMore(false);
                } else {
                    setLoading(false);
                }
            }
        },
        [slug],
    );

    const loadSortedKeepingOpened = useCallback(
        async (nextSort: CommentSort) => {
            if (!slug) return;

            const pagesToKeep = Math.max(1, page);

            setLoading(true);
            try {
                setErrorText(null);

                const requests = Array.from({ length: pagesToKeep }, (_, i) =>
                    fetchAnimeComments({
                        slug,
                        page: i + 1,
                        perPage: PER_PAGE,
                        sort: nextSort,
                    }),
                );

                const responses = await Promise.all(requests);
                const merged = responses.flatMap((r) => r.data?.items ?? []);
                const last = responses[responses.length - 1]?.data;

                setItems(merged);
                setSort(nextSort);
                setPage(pagesToKeep);
                setHasMore(Boolean(last?.pagination.has_more));
            } catch (error) {
                setErrorText(getErrorMessage(error, 'Failed to load comments.'));
            } finally {
                setLoading(false);
            }
        },
        [slug, page],
    );

    // useEffect
    useEffect(() => {
        void loadPage(1, false, sort);
    }, [loadPage]);

    // Keep floating button inside comments block bounds.
    useEffect(() => {
        const onScroll = () => {
            if (items.length === 0 || !commentsBlockRef.current) {
                setShowJumpToFirst(false);
                return;
            }

            const rect = commentsBlockRef.current.getBoundingClientRect();
            const scrollY = window.scrollY;
            const blockTop = rect.top + scrollY;
            const blockBottom = rect.bottom + scrollY;

            // Show only while user is scrolling inside comments zone.
            const shouldShow = scrollY > blockTop + 240 && scrollY < blockBottom - 120;

            setShowJumpToFirst(shouldShow);
        };

        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', onScroll);
        return () => {
            window.removeEventListener('scroll', onScroll);
            window.removeEventListener('resize', onScroll);
        };
    }, [items.length]);

    const scrollToCommentsTop = useCallback(() => {
        if (!commentsBlockRef.current) return;

        // Fixed offset to avoid overlap with sticky header.
        const targetTop = commentsBlockRef.current.getBoundingClientRect().top + window.scrollY - 90;
        window.scrollTo({
            top: Math.max(targetTop, 0),
            behavior: 'smooth',
        });
    }, []);

    const resetReplyState = () => {
        setReplyState(null);
        setDraft('');
        setHasSpoiler(false);
    };

    const startReply = (rootId: number, targetUser: AnimeCommentUser, targetCommentId: number) => {
        if (!user) {
            toast.error('Login required to reply.');
            return;
        }

        const mention = `@${targetUser.name} `;
        setReplyState({
            parentId: rootId,
            targetCommentId,
            replyToUserId: targetUser.id,
            replyToName: targetUser.name,
        });

        setDraft((prev) => {
            if (prev.trim() === '') return mention;
            if (prev.startsWith(mention)) return prev;
            return prev;
        });
    };

    const submitComment = async () => {
        if (!user) {
            toast.error('Login required to comment.');
            return;
        }

        if (!animeId) {
            toast.error('Anime is not loaded yet.');
            return;
        }

        const body = draft.trim();
        if (body === '') {
            toast.error('Comment us empty.');
            return;
        }
        setSubmitting(true);

        try {
            const response = await createAnimeComment(animeId, {
                body,
                has_spoiler: hasSpoiler,
                parent_id: replyState?.parentId ?? null,
                reply_to_user_id: replyState?.replyToUserId ?? null,
            });
            const created = response.data?.item ?? null;

            setDraft('');
            setHasSpoiler(false);
            resetReplyState();

            if (created) {
                // Keep user on the same scroll position: update in-place, no full reload.
                setItems((prev) => insertCreatedComment(prev, created, sort));
                return;
            }

            // Fallback only when backend did not return created comment payload.
            await loadPage(page, false, sort);
        } catch (error) {
            toast.error(getErrorMessage(error, 'Failed to send comment.'));
        } finally {
            setSubmitting(false);
        }
    };

    const handleVote = async (commentId: number, vote: CommentVoteValue) => {
        if (!user) {
            toast.error('Login required to vote.');
            return;
        }

        if (votePending[commentId]) {
            return;
        }

        setVotePending((prev) => ({ ...prev, [commentId]: true }));

        try {
            const response = await voteAnimeComment(commentId, vote);
            const updated = response.data?.item;

            if (updated) {
                setItems((prev) => updateCommentInTree(prev, updated));
            }
        } catch (error) {
            toast.error(getErrorMessage(error, 'Failed to update vote.'));
        } finally {
            setVotePending((prev) => ({ ...prev, [commentId]: false }));
        }
    };

    const toggleSpoiler = (commentId: number) => {
        setRevealedSpoilers((prev) => ({
            ...prev,
            [commentId]: !prev[commentId],
        }));
    };

    const renderCommentBody = (comment: AnimeCommentItem) => {
        if (comment.is_deleted) {
            return <p className="text-sm italic text-muted-foreground">Comment deleted</p>;
        }

        if (comment.has_spoiler && !revealedSpoilers[comment.id]) {
            return (
                <Button type="button" variant="toggle" onClick={() => toggleSpoiler(comment.id)}>
                    Show spoiler
                </Button>
            );
        }
        return (
            <p className="whitespace-pre-wrap wrap-break-word text-sm text-foreground">
                {comment.reply_to_user ? (
                    <span className="font-semibold text-chart-1">
                        @{comment.reply_to_user.name}{' '}
                    </span>
                ) : null}
                {comment.body}
            </p>
        );
    };

    const renderCommentActions = (comment: AnimeCommentItem, rootId: number) => {
        const pending = Boolean(votePending[comment.id]);

        return (
            <div className="mt-2 flex flex-wrap items-center gap-2">
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={pending}
                    className={cn(comment.my_vote === 1 && 'border-chart-1 text-chart-1')}
                    onClick={() => handleVote(comment.id, comment.my_vote === 1 ? 0 : 1)}
                >
                    👍 {comment.likes_count}
                </Button>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={pending}
                    className={cn(comment.my_vote === -1 && 'border-danger-border text-danger-fg')}
                    onClick={() => handleVote(comment.id, comment.my_vote === -1 ? 0 : -1)}
                >
                    👎 {comment.dislikes_count}
                </Button>

                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={comment.is_deleted}
                    onClick={() =>
                        startReply(
                            rootId,
                            {
                                id: comment.user.id,
                                name: comment.user.name,
                                avatar_path: comment.user.avatar_path,
                                avatar_url: comment.user.avatar_url,
                            },
                            comment.id,
                        )
                    }
                >
                    Reply
                </Button>
            </div>
        );
    };

    const renderInlineReplyForm = (commentId: number) => {
        if (!user || !replyState || replyState.targetCommentId !== commentId) return null;
        return (
            <div className="mt-3 rounded-lg border border-border bg-background-light/40 p-3">
                <p className="mb-2 text-sm text-muted-foreground">
                    Replying to <strong>@{replyState.replyToName}</strong>
                </p>
                <Textarea value={draft} onChange={(e) => setDraft(e.target.value)} rows={3} />
                <div className="mt-2 flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={resetReplyState}>
                        Cancel
                    </Button>
                    <Button type="button" disabled={submitting} onClick={submitComment}>
                        {submitting ? 'Sending...' : 'Send reply'}
                    </Button>
                </div>
            </div>
        );
    };

    return (
        <section className="relative p-6">
            {loading && <LoadingOverlay />}
            <div ref={commentsBlockRef} className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <h3 className="text-xl font-semibold text-foreground">Comments</h3>

                    <div className="w-40">
                        <Select
                            value={sort}
                            onValueChange={(value) => {
                                const nextSort = value as CommentSort;
                                if (nextSort === sort) return;
                                void loadSortedKeepingOpened(nextSort);
                            }}
                        >
                            <SelectTrigger className="bg-chart-2 cursor-pointer">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem className="cursor-pointer" value="new">
                                    newest
                                </SelectItem>
                                <SelectItem className="cursor-pointer" value="top">
                                    top rated
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {user ? (
                    <div className="rounded-xl border border-border bg-background p-4 shadow-xl">
                        {replyState ? (
                            <div className="mb-2 flex items-center justify-between rounded-lg bg-chart-3/50 px-3 py-2 text-sm">
                                <span>
                                    Replying to <strong>@{replyState.replyToName}</strong>
                                </span>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={resetReplyState}
                                >
                                    Cancel
                                </Button>
                            </div>
                        ) : null}
                        <div className="space-y-3">
                            <Textarea
                                value={draft}
                                onChange={(event) => setDraft(event.target.value)}
                                placeholder="Write your comment..."
                                rows={4}
                            />

                            <div className="flex items-center gap-2 text-sm">
                                <div className="filter-checks">
                                    <Input
                                        id="has-spoiler"
                                        className="demo1"
                                        type="checkbox"
                                        checked={hasSpoiler}
                                        onChange={(event) => setHasSpoiler(event.target.checked)}
                                    />
                                    <Label
                                        htmlFor="has-spoiler"
                                        data-on-label="ON"
                                        data-off-label="OFF"
                                    />
                                </div>
                                <Label htmlFor="has-spoiler">Mark as spoiled</Label>
                            </div>

                            <div className="flex justify-end">
                                <Button type="button" disabled={submitting} onClick={submitComment}>
                                    {submitting ? 'Sending...' : 'Send comment'}
                                </Button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="rounded-xl border border-border bg-background p-4 text-sm text-muted-foreground shadow-xl">
                        Log in to post comments and votes.
                    </div>
                )}

                {errorText ? (
                    <div className="rounded-xl border border-danger/40 bg-danger/10 p-4 text-sm text-danger-fg shadow-xl">
                        {errorText}
                    </div>
                ) : items.length === 0 ? (
                    <div className="rounded-xl border border-border bg-background p-4 text-sm text-muted-foreground shadow-xl">
                        No comments yet.
                    </div>
                ) : (
                    <div className="space-y-4 ">
                        {items.map((root) => {
                            const avatarUrl = resolveAvatarUrl(root.user);

                            return (
                                <article
                                    key={root.id}
                                    className="rounded-xl border border-border bg-background p-4 shadow-xl"
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="h-10 w-10 overflow-hidden rounded-full bg-chart-3/70">
                                            {avatarUrl ? (
                                                <img
                                                    src={avatarUrl}
                                                    alt={root.user.name}
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-foreground">
                                                    {(root.user.name || '?')
                                                        .slice(0, 1)
                                                        .toUpperCase()}
                                                </div>
                                            )}
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <div className="flex flex-wrap items-center gap-2 text-sm">
                                                <span className="font-semibold text-foreground">
                                                    {root.user.name}
                                                </span>
                                                <span className="text-xs text-muted-foreground">
                                                    {formatDate(root.created_at)}
                                                </span>
                                                {root.is_edited ? (
                                                    <span className="text-xs text-muted-foreground">
                                                        (edited)
                                                    </span>
                                                ) : null}
                                            </div>

                                            <div className="mt-2">{renderCommentBody(root)}</div>
                                            {renderCommentActions(root, root.id)}
                                            {renderInlineReplyForm(root.id)}
                                        </div>
                                    </div>

                                    {root.replies.length > 0 ? (
                                        <div className="mt-4 space-y-3 border-l border-border pl-4">
                                            {root.replies.map((reply) => {
                                                const replyAvatarUrl = resolveAvatarUrl(reply.user);

                                                return (
                                                    <div
                                                        key={reply.id}
                                                        className="rounded-lg bg-background-light/40 p-3"
                                                    >
                                                        <div className="flex items-start gap-3">
                                                            <div className="h-8 w-8 overflow-hidden rounded-full bg-chart-3/70">
                                                                {replyAvatarUrl ? (
                                                                    <img
                                                                        src={replyAvatarUrl}
                                                                        alt={reply.user.name}
                                                                        className="h-full w-full object-cover"
                                                                    />
                                                                ) : (
                                                                    <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-foreground">
                                                                        {(reply.user.name || '?')
                                                                            .slice(0, 1)
                                                                            .toUpperCase()}
                                                                    </div>
                                                                )}
                                                            </div>

                                                            <div className="min-w-0 flex-1">
                                                                <div className="flex flex-wrap items-center gap-2 text-sm">
                                                                    <span className="font-semibold text-foreground">
                                                                        {reply.user.name}
                                                                    </span>
                                                                    <span className="text-xs text-muted-foreground">
                                                                        {formatDate(
                                                                            reply.created_at,
                                                                        )}
                                                                    </span>
                                                                    {reply.is_edited ? (
                                                                        <span className="text-xs text-muted-foreground">
                                                                            (edited)
                                                                        </span>
                                                                    ) : null}
                                                                </div>

                                                                <div className="mt-2">
                                                                    {renderCommentBody(reply)}
                                                                </div>
                                                                {renderCommentActions(
                                                                    reply,
                                                                    root.id,
                                                                )}
                                                                {renderInlineReplyForm(reply.id)}
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : null}
                                </article>
                            );
                        })}

                        {hasMore || showJumpToFirst ? (
                            // Keep both action buttons on one visual baseline.
                            <div className="sticky bottom-4 z-40 grid grid-cols-[1fr_auto_1fr] items-center gap-2 rounded-lg px-2 py-2">
                                <div />
                                {hasMore ? (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="h-9"
                                        disabled={loadingMore}
                                        onClick={() => loadPage(page + 1, true, sort)}
                                    >
                                        {loadingMore ? 'Loading...' : 'Load more'}
                                    </Button>
                                ) : (
                                    <div />
                                )}
                                <div className="flex justify-end">
                                    {showJumpToFirst ? (
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant="solid"
                                            className="h-9 shadow-lg bg-chart-3/50 hover:bg-chart-3/70 text-foreground"
                                            onClick={scrollToCommentsTop}
                                        >
                                            To first comment
                                        </Button>
                                    ) : null}
                                </div>
                            </div>
                        ) : null}

                    </div>
                )}
            </div>
        </section>
    );
}
