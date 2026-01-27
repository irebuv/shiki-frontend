type FilterGroupFiltersCellProps = {
    row: Record<string, any>;
    onDeleteFilter: (filterId: number) => void;
};

export function FilterGroupFiltersCell({ row, onDeleteFilter }: FilterGroupFiltersCellProps) {
    const filters = Array.isArray(row.filters) ? row.filters : [];

    if (filters.length === 0) {
        return <div className="text-sm opacity-60">No filters</div>;
    }

    return (
        <div className="flex flex-col gap-1 text-sm">
            {filters.map((filter: any) => (
                <div key={filter.id} className="flex items-center gap-2">
                    <span>
                        - {filter.title}{' '}
                        {!filter.visible && <span className="text-amber-500">(hidden)</span>}
                    </span>
                    <button
                        type="button"
                        className="inline-flex h-6 w-6 items-center cursor-pointer bg-border
                         justify-center rounded-full border text-xs hover:bg-ring"
                        onClick={() => onDeleteFilter(filter.id)}
                        title="Delete filter"
                    >
                        x
                    </button>
                </div>
            ))}
        </div>
    );
}

