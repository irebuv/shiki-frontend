export const capitalize = (value?: string | null, fallback = '-') => {
    if (!value) return fallback;
    return value.charAt(0).toUpperCase() + value.slice(1);
};
