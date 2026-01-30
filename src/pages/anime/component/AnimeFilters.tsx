import AgeRating from './filters/AgeRating';
import Filter from './filters/Filter';
import FilterBy from './filters/FilterBy';
import Kind from './filters/Kind';
import Sorts from './filters/Sorts';
import { useEffect, useMemo } from 'react';

export default function AnimeFilters({
    filters,
    setFilters,
    availableFilters = {},
    studios = [],
    activeFilters = [],
    activeStudios = [],
    activeAgeRating = [],
}: {
    filters: any;
    setFilters: any;
    availableFilters?: Record<string, any>;
    activeFilters?: string[];
    studios?: { id: number; name: string }[];
    activeStudios?: string[];
    activeAgeRating?: string[];
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
            <Filter title={'Sort BY'} storageKey="sort">
                <Sorts sort={filters?.sort ?? 'updated_at:desc'} setFilters={setFilters} />
            </Filter>
            <Filter title={'Type'} storageKey="type">
                <Kind value={filters?.type} setFilters={setFilters} />
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
                <AgeRating setFilters={setFilters} selected={activeAgeRating} />
            </Filter>
        </div>
    );
}
