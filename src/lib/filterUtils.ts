export const normalizeList = (value?: string[] | string) => {
    if (Array.isArray(value)) return value;
    if (!value) return [];
    return String(value).split(',').filter(Boolean);
};

export const updateListFilter = <K extends string>(
    key: K,
    list: string[],
    value: string,
): Record<K, string[] | undefined> => {
    const next = list.filter((id) => id !== value);
    return { [key]: next.length ? next : undefined } as Record<K, string[] | undefined>;
};
