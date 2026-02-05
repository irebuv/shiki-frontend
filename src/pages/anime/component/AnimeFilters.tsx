import Filter from './filters/Filter';
import FilterBy from './filters/FilterBy';
import FilterPresets from './filters/FilterPresets';
import Kind from './filters/Kind';
import Sorts from './filters/Sorts';
import { useEffect, useMemo } from 'react';
import type { AnimeFilterPreset, FilterItem } from '@/types/anime';
import { AGE_RATING_OPTIONS } from '@/lib/filters/ageRating';
import { buildSeasonYearLabelMap } from '@/lib/filters/seasonYear';

export { ChosenFilters } from './filters/ChosenFilters';

export default function AnimeFilters({
    filters,
    setFilters,
    availableFilters = {},
    studios = [],
    season = [],
    year = [],
    activeFilters = [],
    activeStudios = [],
    activeAgeRating = [],
    activeSeason = [],
    activeYear = [],
    presets = [],
    presetsLoading = false,
    canSavePreset = false,
    isAuthenticated = false,
    onApplyPreset,
    onCreatePreset,
    onDeletePreset,
}: {
    filters: any;
    setFilters: any;
    availableFilters?: Record<string, any>;
    activeFilters?: string[];
    studios?: FilterItem[];
    season?: FilterItem[];
    year?: FilterItem[];
    activeStudios?: string[];
    activeAgeRating?: string[];
    activeSeason?: string[];
    activeYear?: string[];
    presets?: AnimeFilterPreset[];
    presetsLoading?: boolean;
    canSavePreset?: boolean;
    isAuthenticated?: boolean;
    onApplyPreset?: (preset: AnimeFilterPreset) => void;
    onCreatePreset?: (name: string) => void;
    onDeletePreset?: (preset: AnimeFilterPreset) => void;
}) {
    const visibleFiltersMap = useMemo(() => {
        const entries = Object.entries(availableFilters ?? {}).map(([key, items]) => {
            const arr = Array.isArray(items) ? items : [];
            const visibleItems = arr.filter((item) => {
                if (item && typeof item === 'object' && 'visible' in item) {
                    return item.visible !== false;
                }
                return true;
            });
            return [key, visibleItems] as const;
        });

        const nonEmpty = entries.filter(([, items]) => items.length > 0);
        return Object.fromEntries(nonEmpty);
    }, [availableFilters]);

    const validFilterValues = useMemo(() => {
        const set = new Set<string>();
        Object.values(visibleFiltersMap).forEach((items) => {
            (Array.isArray(items) ? items : []).forEach((item) => {
                if (typeof item === 'string' || typeof item === 'number') {
                    set.add(String(item));
                    return;
                }
                const value = item?.value ?? item?.id ?? item?.name ?? item?.title;
                if (value !== undefined && value !== null && value !== '') {
                    set.add(String(value));
                }
            });
        });
        return set;
    }, [visibleFiltersMap]);

    const hasFilterData = Object.keys(visibleFiltersMap).length > 0;

    const yearOptions = useMemo(() => {
        const labelMap = buildSeasonYearLabelMap();
        return (Array.isArray(year) ? year : []).map((item) => {
            if (typeof item === 'string' || typeof item === 'number') {
                const key = String(item);
                return { value: key, label: labelMap.get(key) ?? key };
            }
            const value = item?.value ?? item?.id ?? item?.name ?? item?.title ?? item?.label ?? '';
            const key = String(value);
            const label = item?.label ?? item?.name ?? item?.title ?? labelMap.get(key) ?? key;
            return { value: key, label };
        });
    }, [year]);

    useEffect(() => {
        if (!activeFilters.length) return;
        if (!hasFilterData) return;
        if (validFilterValues.size === 0) {
            setFilters({ filters: undefined });
            return;
        }
        const sanitized = activeFilters.filter((value) => validFilterValues.has(String(value)));
        if (sanitized.length === activeFilters.length) return;
        setFilters({ filters: sanitized.length ? sanitized : undefined });
    }, [activeFilters, validFilterValues, hasFilterData, setFilters]);

    return (
        <div>
            {(onApplyPreset || onCreatePreset || onDeletePreset) && (
                <Filter title={'Presets'} storageKey="presets">
                    <FilterPresets
                        presets={presets}
                        loading={presetsLoading}
                        canSave={canSavePreset}
                        isAuthenticated={isAuthenticated}
                        onApply={(preset) => onApplyPreset?.(preset)}
                        onCreate={(name) => onCreatePreset?.(name)}
                        onDelete={(preset) => onDeletePreset?.(preset)}
                    />
                </Filter>
            )}
            <Filter title={'Sort BY'} storageKey="sort" defaultOpen={true}>
                <Sorts sort={filters?.sort ?? 'updated_at:desc'} setFilters={setFilters} />
            </Filter>
            <Filter title={'Type'} storageKey="type" defaultOpen={true}>
                <Kind value={filters?.type} setFilters={setFilters} />
            </Filter>
            <Filter title={'Year'} storageKey="released_year">
                <FilterBy
                    items={yearOptions}
                    setFilters={setFilters}
                    selected={activeYear}
                    paramKey='year'
                />
            </Filter>
            <Filter title={'Season'} storageKey="season">
                <FilterBy
                    items={season}
                    setFilters={setFilters}
                    selected={activeSeason}
                    paramKey='season'
                />
            </Filter>
            {Object.entries(visibleFiltersMap).map(([key, items]) => (
                <Filter key={key} storageKey={key} title={key}>
                    <FilterBy
                        items={items}
                        setFilters={setFilters}
                        selected={activeFilters}
                        idPrefix={key}
                    />
                </Filter>
            ))}
            {studios.length > 0 && (
                <Filter title={'Studios'} storageKey="studios">
                    <FilterBy
                        items={studios}
                        setFilters={setFilters}
                        selected={activeStudios}
                        paramKey="studios"
                    />
                </Filter>
            )}
            <Filter title={'Rating'} storageKey="age_rating">
                <FilterBy
                    items={AGE_RATING_OPTIONS}
                    setFilters={setFilters}
                    selected={activeAgeRating}
                    paramKey="age_rating"
                />
            </Filter>
        </div>
    );
}
