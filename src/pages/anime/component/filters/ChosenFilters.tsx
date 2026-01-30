import { Button } from '@/components/ui/button';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useEffect, useState } from 'react';

type Props = {
    activeTypes: string[];
    activeStudios: string[];
    activeAgeRating: string[];
    activeFilters: string[];
    typeLabelMap: Record<string, string>;
    studioTitleMap: Map<string, string>;
    filterTitleMap: Map<string, string>;
    filterGroupMap: Map<string, string>;
    ageRatingMap: Map<string, string>;
    onRemoveType: (value: string) => void;
    onRemoveStudio: (value: string) => void;
    onRemoveFilter: (value: string) => void;
    onRemoveAgeRate: (value: string) => void;
    onClearAll: () => void;
};

export function ChosenFilters({
    activeTypes,
    activeStudios,
    activeFilters,
    activeAgeRating,
    typeLabelMap,
    studioTitleMap,
    filterTitleMap,
    filterGroupMap,
    ageRatingMap,
    onRemoveType,
    onRemoveStudio,
    onRemoveFilter,
    onRemoveAgeRate,
    onClearAll,
}: Props) {
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

    if (!hasAny) return null;

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
                <Button variant="clear" onClick={onClearAll}>
                    Clear all
                </Button>
                <Button variant="toggle" className="mr-1" onClick={() => (hidden ? show() : hide())}>
                    {hidden ? 'Show list' : 'Hide list'}
                </Button>
                {renderGroup(
                    'Type',
                    activeTypes,
                    (value) => typeLabelMap[value] ?? value,
                    onRemoveType,
                    hidden,
                )}
                {renderGroup(
                    'Rating',
                    activeAgeRating,
                    (value) => ageRatingMap.get(value) ?? value,
                    onRemoveAgeRate,
                    hidden,
                )}
                {renderGroup(
                    'Studio',
                    activeStudios,
                    (value) => studioTitleMap.get(value) ?? value,
                    onRemoveStudio,
                    hidden,
                )}
                {Array.from(grouped.entries()).map(([groupLabel, values]) =>
                    renderGroup(
                        groupLabel,
                        values,
                        (value) => filterTitleMap.get(value) ?? value,
                        onRemoveFilter,
                        hidden,
                        `group-${groupLabel}`,
                    ),
                )}
            </div>
        </div>
    );
}
