type FilterItem =
    | string
    | number
    | { id?: string | number; title?: string; name?: string; value?: string | number };

type Props = {
    items: FilterItem[];
    setFilters: (values: { filters: string[] | undefined }) => void;
    selected?: string[]; 
};

export default function FilterBy({ items, setFilters, selected = [] }: Props) {
    const selectedSet = new Set(selected);

    const normalize = (el: FilterItem) => {
        if (typeof el === 'string' || typeof el === 'number') {
            const str = String(el);
            return { id: str, title: str, value: str };
        }
        const value = el.value ?? el.id ?? el.name ?? el.title ?? '';
        const id = el.id ?? value ?? '';
        const title = el.title ?? el.name ?? String(value ?? id);
        return { id: String(id), title: title, value: String(value) };
    };

    function toggle(value: string, checked: boolean) {
        const scrollY = window.scrollY; // preserve scroll position
        const next = new Set(selectedSet);
        if (checked) {
            next.add(value);
        } else {
            next.delete(value);
        }
        const asArray = Array.from(next);
        setFilters({ filters: asArray.length ? asArray : undefined });
        requestAnimationFrame(() => window.scrollTo(0, scrollY));
    }

    return (
        <ul className="current-filter">
            {items.map((el) => {
                const item = normalize(el);
                const value = item.value;
                const isChecked = selectedSet.has(value);
                return (
                    <label
                        htmlFor={`${item.id}`}
                        key={item.id}
                        className="flex w-full cursor-pointer items-center p-2 hover:bg-input"
                    >
                        <input
                            id={`${item.id}`}
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => toggle(value, e.target.checked)}
                        />
                        &nbsp;&nbsp;
                        <span>{item.title}</span>
                    </label>
                );
            })}
        </ul>
    );
}
