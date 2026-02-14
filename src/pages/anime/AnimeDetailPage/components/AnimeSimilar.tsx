import { Button } from '@/components/ui/button';
import { imageUrl } from '@/lib/imageUrl';
import { capitalize } from '@/lib/stringUtils';
import { AnimeSimilarItem } from '@/types/anime';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

type AnimeSimilarProps = {
    similarItems: AnimeSimilarItem[];
    typeLabelMap?: Record<string, string>;
};

const MOBILE_QUERY = '(max-width: 639px)';
const DESKTOP_PAGE_SIZE = 4;
const MOBILE_PAGE_SIZE = 1;
const SWIPE_THRESHOLD = 50;

export default function AnimeSimilar({ similarItems, typeLabelMap }: AnimeSimilarProps) {
    const [page, setPage] = useState(0);
    const [isMobile, setIsMobile] = useState<boolean>(() => {
        if (typeof window === 'undefined') return false;
        return window.matchMedia(MOBILE_QUERY).matches;
    });
    const interactionLockRef = useRef(false);
    const wheelReleaseTimer = useRef<number | null>(null);
    const sliderRef = useRef<HTMLDivElement | null>(null);

    const pageSize = isMobile ? MOBILE_PAGE_SIZE : DESKTOP_PAGE_SIZE;

    const pointerStartX = useRef<number | null>(null);
    const pointerStartAt = useRef<number>(0);
    const lastWheelAt = useRef(0);

    const pages = useMemo(() => {
        const items = similarItems.filter((item) => Boolean(item.slug));
        const chunks: AnimeSimilarItem[][] = [];
        for (let i = 0; i < items.length; i += pageSize) {
            chunks.push(items.slice(i, i + pageSize));
        }
        return chunks;
    }, [similarItems, pageSize]);

    const totalPages = pages.length;
    useEffect(() => {
        const preventGlobalScroll = (event: WheelEvent | TouchEvent) => {
            if (!interactionLockRef.current) return;
            event.preventDefault();
        };

        window.addEventListener('wheel', preventGlobalScroll, { passive: false });
        window.addEventListener('touchmove', preventGlobalScroll, { passive: false });

        return () => {
            window.removeEventListener('wheel', preventGlobalScroll);
            window.removeEventListener('touchmove', preventGlobalScroll);
            if (wheelReleaseTimer.current !== null) {
                window.clearTimeout(wheelReleaseTimer.current);
            }
        };
    }, []);
    const startInteraction = () => {
        interactionLockRef.current = true;
    };

    const stopInteraction = () => {
        interactionLockRef.current = false;
    };

    useEffect(() => {
        setPage((prev) => Math.min(prev, Math.max(totalPages - 1, 0)));
    }, [totalPages]);

    useEffect(() => {
        setPage(0);
    }, [pageSize]);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const media = window.matchMedia(MOBILE_QUERY);
        const onChange = (e: MediaQueryListEvent) => setIsMobile(e.matches);

        setIsMobile(media.matches);
        media.addEventListener('change', onChange);

        return () => media.removeEventListener('change', onChange);
    }, []);

    const canPrev = page > 0;
    const canNext = page < totalPages - 1;

    const goPrev = useCallback(() => {
        setPage((prev) => (prev > 0 ? prev - 1 : prev));
    }, []);

    const goNext = useCallback(() => {
        setPage((prev) => (prev < totalPages - 1 ? prev + 1 : prev));
    }, [totalPages]);

    const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
        pointerStartX.current = event.clientX;
        pointerStartAt.current = Date.now();
        startInteraction();
    };

    const onPointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
        if (pointerStartX.current === null) return;

        const dx = event.clientX - pointerStartX.current;
        const dt = Date.now() - pointerStartAt.current;
        pointerStartX.current = null;

        if (dt <= 800 && Math.abs(dx) >= SWIPE_THRESHOLD && totalPages > 1) {
            if (dx < 0) goNext();
            if (dx > 0) goPrev();
        }

        stopInteraction();
    };

    const onPointerCancel = () => {
        pointerStartX.current = null;
        stopInteraction();
    };

    const onWheelNative = useCallback(
        (event: WheelEvent) => {
            event.preventDefault();
            event.stopPropagation();
            startInteraction();

            if (wheelReleaseTimer.current !== null) {
                window.clearTimeout(wheelReleaseTimer.current);
            }
            wheelReleaseTimer.current = window.setTimeout(() => {
                stopInteraction();
                wheelReleaseTimer.current = null;
            }, 140);

            if (totalPages <= 1) return;

            const now = performance.now();
            if (now - lastWheelAt.current < 220) return;
            lastWheelAt.current = now;

            const delta =
                Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
            if (Math.abs(delta) < 12) return;

            if (delta > 0) goNext();
            if (delta < 0) goPrev();
        },
        [goNext, goPrev, totalPages],
    );

    useEffect(() => {
        const el = sliderRef.current;
        if (!el) return;

        el.addEventListener('wheel', onWheelNative, { passive: false });
        return () => {
            el.removeEventListener('wheel', onWheelNative);
        };
    }, [onWheelNative]);

    return (
        <div className="rounded-2xl bg-background-light/60 shadow-sm ring-1 p-5 ring-black/10">
            <div className="mb-4 flex items-center justify-between gap-3">
                <h3 className="text-lg font-semibold">Similar:</h3>
                <div className="flex items-center gap-2">
                    <Button onClick={goPrev} disabled={!canPrev} aria-label="Previous similar page">
                        Prev
                    </Button>
                    <span className="min-w-12 text-center text-xs font-semibold text-muted-foreground">
                        {totalPages === 0 ? '0/0' : `${page + 1}/${totalPages}`}
                    </span>
                    <Button onClick={goNext} disabled={!canNext} aria-label="Next similar page">
                        Next
                    </Button>
                </div>
            </div>
            <div
                ref={sliderRef}
                className="touch-none select-none overflow-hidden overscroll-none"
                onPointerDown={onPointerDown}
                onPointerUp={onPointerUp}
                onPointerCancel={onPointerCancel}
            >
                <div
                    className="flex transition-transform duration-300 ease-out"
                    style={{ transform: `translateX(-${page * 100}%)` }}
                >
                    {pages.map((group, groupIndex) => (
                        <div key={groupIndex} className="w-full shrink-0">
                            <div
                                className={`grid gap-3 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-4'}`}
                            >
                                {group.map((item) => {
                                    const img = imageUrl(item.featured_image);
                                    const typeLabel = item.type
                                        ? (typeLabelMap?.[item.type] ?? item.type)
                                        : null;
                                    const seasonLabel =
                                        item.season || item.season_year
                                            ? `${capitalize(item.season, '')}${item.season_year ? ` ${item.season_year} ` : ''}`.trim()
                                            : null;

                                    return (
                                        <Link
                                            key={item.id}
                                            to={`/anime/${item.slug}`}
                                            className="group rounded-xl border border-border/70 bg-background/70 p-2 transition-all
                                                       hover:border-primary/30 hover:bg-background hover:ring-1 hover:ring-primary/20"
                                        >
                                            <div className="aspect-3/4 overflow-hidden rounded-lg bg-muted/40 ring-1 ring-border/60">
                                                {img ? (
                                                    <img
                                                        src={img}
                                                        alt={item.name}
                                                        className="size-full object-cover transition-transform duration-300
                                                                    group-hover:scale-105"
                                                    />
                                                ) : null}
                                            </div>
                                            <div className="mt-2 min-w-0">
                                                <p className="line-clamp-2 text-sm font-semibold text-foreground group-hover:text-primary">
                                                    {item.name}
                                                </p>
                                                <div className="mt-1 flex flex-wrap gap-2 text-xs">
                                                    {typeLabel ? (
                                                        <span
                                                            className="rounded-full bg-secondary px-2 py-1 font-semibold
                                                       text-secondary-foreground ring-1 ring-border/60"
                                                        >
                                                            {typeLabel}
                                                        </span>
                                                    ) : null}
                                                    {seasonLabel ? (
                                                        <span className="rounded-full bg-chart-1/15 px-2 py-1 font-semibold text-chart-1 ring-1 ring-chart-1/35">
                                                            {seasonLabel}
                                                        </span>
                                                    ) : null}
                                                </div>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            {totalPages > 1 ? (
                <div className="mt-3 flex items-center justify-center gap-1.5">
                    {Array.from({ length: totalPages }).map((_, i) => (
                        <button
                            key={i}
                            type="button"
                            onClick={() => setPage(i)}
                            className={`h-1.5 w-5 rounded-full transition-all ${i === page ? 'bg-primary' : 'bg-primary/25 hover:bg-primary/45'}`}
                            aria-label={`Go to similar page ${i + 1}`}
                        />
                    ))}
                </div>
            ) : null}
        </div>
    );
}
