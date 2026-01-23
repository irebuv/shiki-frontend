export const DESCRIPTION_LINE_OPTIONS = [3, 5, 6, 8, 12, 'all'] as const;
export type DescriptionLines = (typeof DESCRIPTION_LINE_OPTIONS)[number];
