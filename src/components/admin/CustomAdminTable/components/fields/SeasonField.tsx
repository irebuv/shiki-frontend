import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { cn } from '@/lib/utils';
import type { AdminFormField } from '@/types/admin/adminTable';
import { Check, Leaf, Snowflake, Sun, Flower2 } from 'lucide-react';
import { useEffect } from 'react';

type SeasonFieldProps = {
    field: AdminFormField;
    data: Record<string, any>;
    setData: (name: string, value: any) => void;
    readOnly: boolean;
};

export default function SeasonField({ field, data, setData, readOnly }: SeasonFieldProps) {
    const [open, setOpen] = useLocalStorage<boolean>(`admin:season-field:${field.name}`, true);

    const selectedYear = data[field.name];
    const selectedSeason = field.secondaryName ? data[field.secondaryName] : undefined;

    useEffect(() => {
        if (readOnly) return;
        const hasYear = selectedYear !== undefined && selectedYear !== null && selectedYear !== '';
        const hasSeason =
            selectedSeason !== undefined && selectedSeason !== null && selectedSeason !== '';

        if (!hasYear) {
            const currentYear = new Date().getFullYear();
            const optionMatch = (field.options ?? []).find(
                (option) => String(option.value) === String(currentYear),
            );
            const nextYear = optionMatch ? optionMatch.value : field.options?.[0]?.value;
            if (nextYear !== undefined) {
                setData(field.name, field.parseAsNumber ? Number(nextYear) : nextYear);
            }
        }

        if (field.secondaryName && !hasSeason) {
            const month = new Date().getMonth();
            const currentSeason =
                month <= 1 || month === 11
                    ? 'winter'
                    : month <= 4
                      ? 'spring'
                      : month <= 7
                        ? 'summer'
                        : 'fall';
            const seasonMatch = (field.secondaryOptions ?? []).find(
                (option) => String(option.value) === currentSeason,
            );
            const nextSeason = seasonMatch
                ? seasonMatch.value
                : field.secondaryOptions?.[0]?.value;
            if (nextSeason !== undefined) {
                setData(
                    field.secondaryName,
                    field.secondaryParseAsNumber ? Number(nextSeason) : nextSeason,
                );
            }
        }
    }, [
        field.name,
        field.options,
        field.parseAsNumber,
        field.secondaryName,
        field.secondaryOptions,
        field.secondaryParseAsNumber,
        readOnly,
        selectedSeason,
        selectedYear,
        setData,
    ]);

    return (
        <div className="rounded-xl border bg-background p-3">
            <div className="flex items-center justify-between gap-3">
                <div className="text-sm font-semibold text-chart-3">Chose a year and a season here:</div>
                <Button
                    type="button"
                    variant="filter"
                    size="sm"
                    className="cursor-pointer"
                    onClick={() => setOpen((v) => !v)}
                >
                    {open ? 'Hide' : 'Show'}
                </Button>
            </div>

            {open && (
                <div className="mt-4 grid gap-5 sm:grid-cols-[1.6fr_1fr]">
                    <div className="space-y-2">
                        <div id={`${field.id}-year`} className="grid grid-cols-3 gap-2">
                            {(field.options ?? []).map((option) => {
                                const value = String(option.value);
                                const isActive = String(selectedYear ?? '') === value;
                                return (
                                    <button
                                        key={value}
                                        type="button"
                                        disabled={readOnly}
                                        onClick={() => {
                                            if (readOnly) return;
                                            const nextValue = field.parseAsNumber
                                                ? Number(option.value)
                                                : option.value;
                                            setData(field.name, nextValue);
                                        }}
                                        className={cn(
                                            'cursor-pointer rounded-lg border px-2 py-2 text-xs font-semibold transition flex items-center justify-between gap-2',
                                            isActive
                                                ? 'border-sky-300 bg-sky-100 text-sky-900'
                                                : 'border-sky-100 bg-white text-sky-700 hover:border-sky-200 hover:bg-sky-50',
                                            readOnly && 'cursor-not-allowed opacity-60',
                                        )}
                                    >
                                        <span>{option.label}</span>
                                        {isActive && <Check className="size-3.5 text-sky-700" />}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="space-y-2 flex justify-center">
                        <div
                            id={`${field.id}-season`}
                            role="radiogroup"
                            aria-label={field.secondaryLabel ?? 'Season'}
                            className="relative grid h-60 w-60 grid-cols-2 grid-rows-2 overflow-hidden rounded-full border bg-muted/20 shadow-sm"
                        >
                            {(field.secondaryOptions ?? []).map((option) => {
                                const value = String(option.value);
                                const isActive = String(selectedSeason ?? '') === value;
                                const nudgeClass =
                                    value === 'winter'
                                        ? 'translate-x-1.5 translate-y-1.5'
                                        : value === 'spring'
                                          ? '-translate-x-1.5 translate-y-1.5'
                                          : value === 'summer'
                                            ? 'translate-x-1.5 -translate-y-1.5'
                                            : '-translate-x-1.5 -translate-y-1.5';
                                const baseClass =
                                    value === 'winter'
                                        ? 'bg-sky-200/60 text-sky-900'
                                        : value === 'spring'
                                          ? 'bg-emerald-200/60 text-emerald-900'
                                          : value === 'summer'
                                            ? 'bg-amber-200/60 text-amber-900'
                                            : 'bg-orange-200/60 text-orange-900';
                                const activeClass =
                                    value === 'winter'
                                        ? 'bg-sky-300 text-sky-950'
                                        : value === 'spring'
                                          ? 'bg-emerald-300 text-emerald-950'
                                          : value === 'summer'
                                            ? 'bg-amber-300 text-amber-950'
                                            : 'bg-orange-300 text-orange-950';
                                const label =
                                    value === 'winter'
                                        ? 'WIN'
                                        : value === 'spring'
                                          ? 'SPR'
                                          : value === 'summer'
                                            ? 'SUM'
                                            : 'FAL';
                                const Icon =
                                    value === 'winter'
                                        ? Snowflake
                                        : value === 'spring'
                                          ? Flower2
                                          : value === 'summer'
                                            ? Sun
                                            : Leaf;

                                return (
                                    <button
                                        key={value}
                                        type="button"
                                        role="radio"
                                        aria-checked={isActive}
                                        disabled={readOnly}
                                        onClick={() => {
                                            if (readOnly) return;
                                            const nextValue = field.secondaryParseAsNumber
                                                ? Number(option.value)
                                                : option.value;
                                            setData(field.secondaryName!, nextValue);
                                        }}
                                        className={cn(
                                            'flex items-center justify-center text-[11px] font-semibold uppercase transition focus:outline-none cursor-pointer relative',
                                            isActive ? activeClass : baseClass,
                                            isActive ? 'opacity-100' : 'opacity-75 hover:opacity-100',
                                            readOnly && 'cursor-not-allowed opacity-70',
                                        )}
                                    >
                                        <div className={cn('flex flex-col items-center justify-center gap-0.5 pt-1', nudgeClass)}>
                                            <Icon className="size-4" />
                                            <span>{label}</span>
                                            {isActive && (
                                                <span className="mt-0.5 rounded-full bg-white/85 p-0.5 text-chart-3 shadow">
                                                    <Check className="size-3" />
                                                </span>
                                            )}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
