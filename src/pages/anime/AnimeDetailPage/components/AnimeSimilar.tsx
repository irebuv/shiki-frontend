import { imageUrl } from '@/lib/imageUrl';
import { capitalize } from '@/lib/stringUtils';
import { AnimeSimilarItem } from '@/types/anime';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

type AnimeSimilarProps = {
    similarItems: AnimeSimilarItem[];
    typeLabelMap?: Record<string, string>;
};

const PAGE_SIZE = 4;
const SWIPE_THRESHOLD = 50;
const WHEEL_COOLDOWN_NS = 320;

export default function AnimeSimilar({ similarItems, typeLabelMap }: AnimeSimilarProps) {
    const [page, setPage] = useState(0);

    const pointerStartX = useRef<number | null>(null);
    const pointerStartAt = useRef<number>(0);
    const wheelLockUntil = useRef<number>(0);

    const pages = useMemo(() => {
        const items = similarItems.filter((item) => Boolean(item.slug));
        const chunks: AnimeSimilarItem[][] = [];
        for (let i = 0; i < items.length; i += PAGE_SIZE) {
            chunks.push(items.slice(i, i + PAGE_SIZE));
        }
        return chunks;
    }, [similarItems]);

    const totalPages = pages.length;

    useEffect(() => {
        setPage((prev) => Math.min(prev, Math.max(totalPages - 1, 0)));
    }, [totalPages]);

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
        if (dx > 0) goPrev;
    };

    const onPointerCancel = () => {
        pointerStartX.current = null;
    };

    const onWheel = (event: React.WheelEvent<HTMLDivElement>) => {
        if (totalPages <= 1) return;

        const now = Date.now();
        if (now < wheelLockUntil.current) return;

        const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
        if (Math.abs(delta) < 28) return;

        event.preventDefault();
        wheelLockUntil.current = now + WHEEL_COOLDOWN_NS;

        if (delta > 0) goNext;
        if (delta < 0) goPrev;
    };

    return (
        <div className="rounded-2xl bg-background-light/60 shadow-sm ring-1 p-6 ring-black/10">
            <div className="mb-4 flex items-center justify-between gap-3">
                <h3 className="text-lg font-semibold">Similar:</h3>
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={goPrev}
                        disabled={!canPrev}
                        className="rounded-full border border-border/70 bg-background/70 px-3 py-1
                         text-xs font-semibold text-foreground transition-colors hover:border-primary/30
                          hover:text-primary disabled:cursor-not-allowed disabled:opacity-45"
                        aria-label="Previous similar page"
                    >
                        Prev
                    </button>
                    <span className="min-w-12 text-center text-xs font-semibold text-muted-foreground">
                        {totalPages === 0 ? '0/0' : `${page + 1}/${totalPages}`}
                    </span>
                    <button
                        type="button"
                        onClick={goNext}
                        disabled={!canNext}
                        className="rounded-full border border-border/70 bg-background/70 px-3 py-1 
                        text-xs font-semibold text-foreground transition-colors hover:border-primary/30
                         hover:text-primary disabled:cursor-not-allowed disabled:opacity-45"
                        aria-label="Next similar page"
                    >
                        Next
                    </button>
                </div>
            </div>
            <div
                className="touch-pan-y select-none overflow-hidden"
                onPointerDown={onPointerDown}
                onPointerUp={onPointerUp}
                onPointerCancel={onPointerCancel}
                onWheel={onWheel}
            >
                <div
                    className="flex transition-transform duration-300 ease-out"
                    style={{ transform: `translateX(-${page * 100})` }}
                >
                    {pages.map((group, groupIndex) => (
                        <div key={groupIndex} className="w-full shrink-0">
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                                {group.map((item) => {
                                    const img = imageUrl(item.featured_image);
                                    const typeLabel = item.type
                                        ? (typeLabelMap[item.type] ?? item.type)
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
                                            <div>

                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
