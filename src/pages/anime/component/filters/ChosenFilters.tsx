import { Button } from '@/components/ui/button';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { updateListFilter } from '@/lib/filterUtils';
import { AGE_RATING_OPTIONS } from '@/lib/ageRating';
import { useEffect, useMemo, useState } from 'react';
import type { AnimeSetFilters } from '../../types';

type ChosenFiltersProps = {
    availableFilters?: Record<string, any>;
    studios?: { id: number; name: string }[];
    activeTypes: string[];
    activeStudios: string[];
    activeAgeRating: string[];
    activeFilters: string[];
    setFilters: AnimeSetFilters;
};

const TYPE_LABEL_MAP: Record<string, string> = {
    tv: 'TV Series',
    tv_short: 'TV Short',
    tv_medium: 'TV Medium',
    tv_long: 'TV Long',
    movie: 'Movie',
    ova: 'OVA',
    ona: 'ONA',
};

const AGE_RATING_MAP = new Map<string, string>(
    AGE_RATING_OPTIONS.map((option) => [String(option.value), option.label]),
);

export function ChosenFilters({
    availableFilters,
    studios,
    activeTypes,
    activeStudios,
    activeFilters,
    activeAgeRating,
    setFilters,
}: ChosenFiltersProps) {
    const hasAny =
        activeTypes.length > 0 ||
        activeStudios.length > 0 ||
        activeFilters.length > 0 ||
        activeAgeRating.length > 0;
    const [hidden, setHidden] = useLocalStorage<boolean>('anime:chosen:collapsed', false);
    const [isGone, setGone] = useState(hidden);

    const hide = () => {
        setHidden(true);
    };

    const show = () => {
        setGone(false);
        requestAnimationFrame(() => setHidden(false));
    };

    useEffect(() => {
        if (!hidden) {
            setGone(false);
        }
    }, [hidden]);

    const { filterTitleMap, filterGroupMap } = useMemo(() => {
        const titleMap = new Map<string, string>();
        const groupMap = new Map<string, string>();
        Object.entries(availableFilters ?? {}).forEach(([groupTitle, items]) => {
            (Array.isArray(items) ? items : []).forEach((item) => {
                if (typeof item === 'string' || typeof item === 'number') {
                    titleMap.set(String(item), String(item));
                    groupMap.set(String(item), groupTitle);
                    return;
                }
                const id = item?.id ?? item?.value ?? item?.title ?? item?.name;
                const title = item?.title ?? item?.name ?? String(id ?? '');
                if (id !== undefined && id !== null) {
                    titleMap.set(String(id), String(title));
                    groupMap.set(String(id), groupTitle);
                }
            });
        });
        return { filterTitleMap: titleMap, filterGroupMap: groupMap };
    }, [availableFilters]);

    const studioTitleMap = useMemo(() => {
        const map = new Map<string, string>();
        (studios ?? []).forEach((studio) => {
            map.set(String(studio.id), studio.name);
        });
        return map;
    }, [studios]);

    if (!hasAny) return null;

    const removeFilter = (value: string) =>
        setFilters(updateListFilter('filters', activeFilters, value));
    const removeStudio = (value: string) =>
        setFilters(updateListFilter('studios', activeStudios, value));
    const removeType = (value: string) => setFilters(updateListFilter('type', activeTypes, value));
    const removeAgeRate = (value: string) =>
        setFilters(updateListFilter('age_rating', activeAgeRating, value));

    const clearAll = () => {
        setFilters({
            type: undefined,
            studios: undefined,
            filters: undefined,
            age_rating: undefined,
        });
    };

    const renderChip = (id: string, label: string, onRemove: (value: string) => void) => (
        <button
            key={id}
            className="cursor-pointer whitespace-nowrap rounded-full text-chart-3 border border-transparent bg-chart-2 px-3 py-1 hover:bg-chart-2/80"
            onClick={() => onRemove(id)}
        >
            {label} <span className="ml-1 text-base text-destructive leading-none">x</span>
        </button>
    );

    const renderGroup = (
        label: string,
        items: string[],
        getLabel: (value: string) => string,
        onRemove: (value: string) => void,
        isHidden: boolean,
        groupKey?: string,
    ) => {
        if (!items.length) return null;
        return (
            <span
                key={groupKey ?? label}
                style={{ display: isGone ? 'none' : 'inline-flex' }}
                onTransitionEnd={() => {
                    if (hidden) setGone(true);
                }}
                className={`inline-flex items-center gap-2 px-1.5 py-1 border-chart-3/15 border rounded-lg transition-all duration-1000 ease-in overflow-hidden ${
                    isHidden
                        ? 'max-w-0 max-h-0 opacity-0 pointer-events-none flex-nowrap'
                        : 'max-w-[1200px] max-h-10 opacity-100 flex-wrap'
                }`}
            >
                <span className="whitespace-nowrap rounded-md border px-2 py-0.5 text-xs font-semibold uppercase text-muted-foreground">
                    {label}:
                </span>
                {items.map((value) => renderChip(value, getLabel(value), onRemove))}
            </span>
        );
    };

    const grouped = new Map<string, string[]>();
    activeFilters.forEach((value) => {
        const group = filterGroupMap.get(value) ?? 'Filters';
        if (!grouped.has(group)) grouped.set(group, []);
        grouped.get(group)!.push(value);
    });

    return (
        <div className="mb-4 inline-flex max-w-full flex-col items-start rounded-lg border bg-background p-2 text-sm">
            <div className="inline-flex w-fit max-w-full flex-wrap items-center gap-3">
                <Button variant="clear" onClick={clearAll}>
                    Clear all
                </Button>
                <Button variant="toggle" className="mr-1" onClick={() => (hidden ? show() : hide())}>
                    {hidden ? 'Show list' : 'Hide list'}
                </Button>
                {renderGroup(
                    'Type',
                    activeTypes,
                    (value) => TYPE_LABEL_MAP[value] ?? value,
                    removeType,
                    hidden,
                )}
                {renderGroup(
                    'Rating',
                    activeAgeRating,
                    (value) => AGE_RATING_MAP.get(value) ?? value,
                    removeAgeRate,
                    hidden,
                )}
                {renderGroup(
                    'Studio',
                    activeStudios,
                    (value) => studioTitleMap.get(value) ?? value,
                    removeStudio,
                    hidden,
                )}
                {Array.from(grouped.entries()).map(([groupLabel, values]) =>
                    renderGroup(
                        groupLabel,
                        values,
                        (value) => filterTitleMap.get(value) ?? value,
                        removeFilter,
                        hidden,
                        `group-${groupLabel}`,
                    ),
                )}
            </div>
        </div>
    );
}
