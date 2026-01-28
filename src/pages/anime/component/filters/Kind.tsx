import { useEffect, useMemo } from 'react';

type KindProps = {
    value?: string[] | string;
    setFilters: (values: { type: string[] | undefined }) => void;
};

const TV_CORE = ['tv_short', 'tv_medium', 'tv_long'];

const normalizeSelection = (input: Set<string>) => {
    const next = new Set(input);
    const hasTv = next.has('tv');

    if (hasTv) {
        TV_CORE.forEach((t) => next.delete(t));
    }

    return next;
};

export default function Kind({ value, setFilters }: KindProps) {
    const selected = Array.isArray(value)
        ? value.map(String)
        : value
          ? [String(value)]
          : [];

    const normalizedSet = useMemo(() => normalizeSelection(new Set(selected)), [selected.join('|')]);

    useEffect(() => {
        const normalizedArray = Array.from(normalizedSet);
        const originalSet = new Set(selected);
        const sameLength = normalizedArray.length === selected.length;
        const sameValues = normalizedArray.every((v) => originalSet.has(v));
        if (sameLength && sameValues) return;
        setFilters({ type: normalizedArray.length ? normalizedArray : undefined });
    }, [normalizedSet, selected, setFilters]);

    const isTvGroupChecked = normalizedSet.has('tv');
    const isTvGroupHighlighted =
        isTvGroupChecked || TV_CORE.every((t) => normalizedSet.has(t));

    const toggle = (type: string, checked: boolean) => {
        const next = new Set(normalizedSet);

        if (type === 'tv') {
            if (checked) {
                next.add('tv');
                TV_CORE.forEach((t) => next.delete(t));
            } else {
                next.delete('tv');
            }
        } else if (checked) {
            if (TV_CORE.includes(type)) {
                next.delete('tv');
            }
            next.add(type);
        } else {
            next.delete(type);
        }

        const nextArray = Array.from(next);
        setFilters({ type: nextArray.length ? nextArray : undefined });
    };

    const typeOptions = [
        { label: 'TV Series', value: 'tv', checked: isTvGroupChecked },
        { label: 'TV Short', value: 'tv_short', isChild: true },
        { label: 'TV Medium', value: 'tv_medium', isChild: true },
        { label: 'TV Long', value: 'tv_long', isChild: true },
        { label: 'Movie', value: 'movie' },
        { label: 'OVA', value: 'ova' },
        { label: 'ONA', value: 'ona' },
    ];

    return (
        <ul className="current-filter">
            {typeOptions.map((el) => {
                const isChecked =
                    el.value === 'tv' ? isTvGroupChecked : normalizedSet.has(el.value);
                const isHighlighted = el.value === 'tv' && isTvGroupHighlighted;
                return (
                    <label
                        htmlFor={`type-${el.value}`}
                        key={el.value}
                        className={[
                            "flex w-full cursor-pointer items-center p-2 hover:bg-input",
                            el.isChild ? "pl-6 text-muted-foreground" : "",
                            isHighlighted ? "bg-primary/10 text-primary" : ""
                        ].join(" ")}
                    >
                        <input
                            id={`type-${el.value}`}
                            type="checkbox"
                            checked={el.value === 'tv' ? isChecked : isChecked}
                            onChange={(e) => toggle(el.value, e.target.checked)}
                        />
                        &nbsp;&nbsp;
                        <span>{el.label}</span>
                    </label>
                );
            })}
        </ul>
    );
}
