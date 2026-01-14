import React from 'react';

type sortValue = 'updated_at' | 'id' | 'description' | 'rating' | 'name' | 'random';
type sortDirection = 'asc' | 'desc';
type sortParam = `${Exclude<sortValue, 'random'>}:${sortDirection}` | 'random';

type Filters = { sort: sortParam };

type SortsProps = {
    sort: sortParam;
    setFilters: (values: Partial<Filters>) => void;
};

const sortBy: { name: string; value: sortValue }[] = [
    { name: 'Date', value: 'updated_at' },
    { name: 'ID', value: 'id' },
    { name: 'Popular', value: 'description' },
    { name: 'Rating', value: 'rating' },
    { name: 'Alphabet', value: 'name' },
    { name: 'Today\'s random', value: 'random' },
];

function parseSort(sort: sortParam): { by: sortValue; dir?: sortDirection } {
    if (sort === 'random') return { by: 'random' };
    const [by, dir] = sort.split(':') as [Exclude<sortValue, 'random'>, sortDirection];
    return { by, dir };
}

export default function Sorts({ setFilters, sort }: SortsProps) {
    const current = parseSort(sort);

    function handleClick(nextBy: sortValue) {
        const prevParsed = parseSort(sort);

        if (nextBy === 'random') {
            setFilters({ sort: 'random' });
            return;
        }

        if (prevParsed.by === nextBy) {
            const nextDir: sortDirection = prevParsed.dir === 'asc' ? 'desc' : 'asc';
            setFilters({ sort: `${nextBy}:${nextDir}` as sortParam });
            return;
        }

        setFilters({ sort: `${nextBy}:desc` as sortParam });
    }

    return (
        <ul>
            {sortBy.map((el) => {
                const isActive = current.by === el.value;
                return (
                    <li
                        key={el.name}
                        className={`p-1 hover:bg-input cursor-pointer ${
                            isActive ? 'bg-chart-2 text-chart-3' : ''
                        }`}
                        onClick={() => handleClick(el.value)}
                    >
                        {el.name}

                        {isActive && el.value !== 'random' && (
                            <span className="ml-2 opacity-70">
                                {current.dir === 'asc' ? "↑" : "↓"}
                            </span>
                        )}
                    </li>
                );
            })}
        </ul>
    );
}
