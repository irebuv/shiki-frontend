import { AGE_RATING_OPTIONS } from '@/lib/ageRating';

type AgeRatingProps = {
    setFilters: (values: { age_rating?: string[] }) => void;
    selected?: string[];
};

export default function AgeRating({ setFilters, selected = [] }: AgeRatingProps) {
    const selectedSet = new Set(selected);
    function toggle(value: string, checked: boolean) {
        const scrollY = window.scrollY;
        const next = new Set(selectedSet);
        if (checked) {
            next.add(value);
        } else {
            next.delete(value);
        }
        const asArray = Array.from(next);
        setFilters({ age_rating: asArray.length ? asArray : undefined });
        requestAnimationFrame(() => window.scrollTo(0, scrollY));
    }
    return (
        <ul className="current-filter">
            {AGE_RATING_OPTIONS.map((el) => {
                const value = String(el.value);
                const isChecked = selectedSet.has(value);
                const inputId = `age-rating-${value}`;
                return (
                    <label
                        htmlFor={inputId}
                        key={value}
                        className="flex w-full cursor-pointer items-center p-2 hover:bg-input"
                    >
                        <input
                            type="checkbox"
                            id={inputId}
                            checked={isChecked}
                            onChange={(e) => toggle(value, e.target.checked)}
                        />
                        &nbsp;&nbsp;
                        <span>{el.label}</span>
                    </label>
                );
            })}
        </ul>
    );
}
