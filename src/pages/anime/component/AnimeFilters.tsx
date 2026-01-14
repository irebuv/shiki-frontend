import Filter from './filters/Filter';
import FilterBy from './filters/FilterBy';
import Kind from './filters/Kind';
import Sorts from './filters/Sorts';

export default function AnimeFilters({
    filters,
    setFilters,
    availableFilters = {},
    activeFilters = [],
}: {
    filters: any;
    setFilters: any;
    availableFilters?: Record<string, any>;
    activeFilters?: string[];
}) {
    return (
        <div>
            <Filter title={'Sort BY'} storageKey="sort">
                <Sorts sort={filters?.sort ?? 'updated_at:desc'} setFilters={setFilters} />
            </Filter>
            <Filter title={'Type'} storageKey="type">
                <Kind />
            </Filter>
            {availableFilters &&
                Object.entries(availableFilters).map(([key, items]) => (
                    <Filter key={key} storageKey={key} title={key}>
                        <FilterBy items={items} setFilters={setFilters} selected={activeFilters} />
                    </Filter>
                ))}
        </div>
    );
}
