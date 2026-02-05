import type { AdminFormFieldOption } from '@/types/admin/adminTable';

export const buildSeasonYearOptions = (
    baseYear: number = new Date().getFullYear(),
): AdminFormFieldOption[] => {
    const currentYear = baseYear;
    const options: AdminFormFieldOption[] = [];
    for (let year = currentYear + 5; year >= currentYear - 10; year -= 1) {
        options.push({ value: year, label: String(year) });
    }
    const bucketStart = Math.floor((currentYear - 11) / 5) * 5;
    for (let year = bucketStart; year >= 2005; year -= 5) {
        if (year === 2010) {
            options.push({ value: 2009, label: '2009-2005' });
            continue;
        }
        if (year === 2005) {
            options.push({ value: 2004, label: '2004-2000' });
            continue;
        }
        options.push({ value: year, label: `${year}-${year - 5}` });
    }
    options.push({ value: 1999, label: 'Before 2000' });
    return options;
};

export const buildSeasonYearLabelMap = (
    baseYear: number = new Date().getFullYear(),
): Map<string, string> =>
    new Map(buildSeasonYearOptions(baseYear).map((option) => [String(option.value), option.label]));
