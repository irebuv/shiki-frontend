import { Button } from '@/components/ui/button';
import { imageUrl } from '@/lib/imageUrl';
import { getSeasonBadge } from '@/lib/seasonBadge';
import { capitalize } from '@/lib/stringUtils';
import type { AnimeSimilarItem } from '@/types/anime';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

type AnimeSimilarProps = {
    similarItems: AnimeSimilarItem[];
    typeLabelMap?: Record<string, string>;
};

const SM_MIN = 640;
const LG_MIN = 1024;
const SWIPE_THRESHOLD = 50;
const WHEEL_THROTTLE_MS = 220;

function resolvePageSize(width: number): 1 | 2 | 4 {
    if (width < SM_MIN) return 1;
    if (width < LG_MIN) return 2;
    return 4;
}

export default function AnimeSimilar({ similarItems, typeLabelMap }: AnimeSimilarProps) {
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState<1 | 2 | 4>(() => {
        if (typeof window === 'undefined') return 4;
        return resolvePageSize(window.innerWidth);
    });

    const sliderRef = useRef<HTMLDivElement | null>(null);
    const pointerStartX = useRef<number | null>(null);
    const pointerStartAt = useRef<number>(0);
    const lastWheelAt = useRef<number>(0);

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
        setPage((prev) => Math.min(prev, Math.max(totalPages - 1, 0)));
    }, [totalPages]);

    useEffect(() => {
        setPage(0);
    }, [pageSize]);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const onResize = () => {
            const next = resolvePageSize(window.innerWidth);
            setPageSize((prev) => (prev === next ? prev : next));
        };

        onResize();
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
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
    };

    const onPointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
        if (pointerStartX.current === null) return;

        const dx = event.clientX - pointerStartX.current;
        const dt = Date.now() - pointerStartAt.current;
        pointerStartX.current = null;

        if (dt > 800 || Math.abs(dx) < SWIPE_THRESHOLD || totalPages <= 1) return;
        if (dx < 0) goNext();
        if (dx > 0) goPrev();
    };

    const onPointerCancel = () => {
        pointerStartX.current = null;
    };

    const onWheelNative = useCallback(
        (event: WheelEvent) => {
            event.preventDefault();
            event.stopPropagation();

            if (totalPages <= 1) return;

            const now = performance.now();
            if (now - lastWheelAt.current < WHEEL_THROTTLE_MS) return;
            lastWheelAt.current = now;

            const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
            if (Math.abs(delta) < 12) return;

            if (delta > 0) goNext();
            if (delta < 0) goPrev();
        },
        [goNext, goPrev, totalPages]
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
        <div className="rounded-2xl bg-background-light/60 p-5 shadow-sm ring-1 ring-black/10">
            <div className="mb-4 flex items-center justify-between gap-3">
               <h3 className='text-xl font-semibold text-foreground'>Similar</h3>
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
                className="touch-pan-x select-none overflow-hidden overscroll-none"
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
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                                {group.map((item) => {
                                    const img = imageUrl(item.featured_image);
                                    const typeLabel = item.type ? (typeLabelMap?.[item.type] ?? item.type) : null;
                                    const seasonBadge = getSeasonBadge(item.season, item.season_year);

                                    return (
                                        <Link
                                            key={item.id}
                                            to={`/anime/${item.slug}`}
                                            className="group rounded-xl border border-border/70 bg-background/70 p-2 transition-all hover:border-primary/30 hover:bg-background hover:ring-1 hover:ring-primary/20"
                                        >
                                            <div className="aspect-3/4 overflow-hidden rounded-lg bg-muted/40 ring-1 ring-border/60">
                                                {img ? (
                                                    <img
                                                        src={img}
                                                        alt={item.name}
                                                        className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                                                    />
                                                ) : null}
                                            </div>
                                            <div className="mt-2 min-w-0">
                                                <p className="line-clamp-1 text-sm font-semibold text-foreground group-hover:text-primary">
                                                    {item.name}
                                                </p>
                                                <div className="mt-1 flex flex-wrap gap-2 text-xs">
                                                    {typeLabel ? (
                                                        <span className="rounded-full bg-secondary px-2 py-1 font-semibold text-secondary-foreground ring-1 ring-border/60">
                                                            {typeLabel}
                                                        </span>
                                                    ) : null}
                                                   {seasonBadge ? (
                                                      <span className={seasonBadge.className}>
                                                         {seasonBadge.label}
                                                      </span>
                                                   ): null}
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
