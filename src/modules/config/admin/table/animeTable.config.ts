import { z } from 'zod';
import type { AdminFormField, AdminFormFieldOption } from '@/types/admin/adminTable';
import { imageUrl } from '@/lib/imageUrl';
import { AGE_RATING_OPTIONS } from '@/lib/filters/ageRating';
import { buildSeasonYearOptions } from '@/lib/filters/seasonYear';
import type { AdminTableRow } from '@/types/admin/adminTable';

const AGE_RATING_VALUES = AGE_RATING_OPTIONS.map((option) => String(option.value));
const SEASON_OPTIONS: AdminFormFieldOption[] = [
    { value: 'winter', label: 'Winter' },
    { value: 'spring', label: 'Spring' },
    { value: 'summer', label: 'Summer' },
    { value: 'fall', label: 'Fall' },
];

const buildFormFields = (studioOptions: AdminFormFieldOption[]): AdminFormField[] => {
    const hasStudios = studioOptions.length > 0;
    return [
        {
            id: 'name',
            name: 'name',
            label: 'Name',
            type: 'text',
            defaultValue: '',
            validation: z.string().trim().min(3, 'Min 3 chars').max(120, 'Max 120 chars'),
        },
        {
            id: 'description',
            name: 'description',
            label: 'Description',
            type: 'textarea',
            defaultValue: '',
            validation: z.string().max(5000, 'Max 5000 chars').optional().or(z.literal('')),
        },
        {
            id: 'rating',
            name: 'rating',
            label: 'Rate',
            type: 'text',
            defaultValue: '',
            validation: z.string().trim().min(1, 'Min 1 chars').max(120, 'Max 120 chars'),
        },
        {
            id: 'type',
            name: 'type',
            label: 'Type',
            type: 'select',
            defaultValue: '',
            options: [
                { value: 'tv_short', label: 'TV Short' },
                { value: 'tv_medium', label: 'TV Medium' },
                { value: 'tv_long', label: 'TV Long' },
                { value: 'movie', label: 'Movie' },
                { value: 'ova', label: 'OVA' },
                { value: 'ona', label: 'ONA' },
            ],
            validation: z
                .string()
                .refine(
                    (value) =>
                        ['tv_short', 'tv_medium', 'tv_long', 'movie', 'ova', 'ona'].includes(value),
                    'Select a valid type',
                ),
        },
        {
            id: 'studio_id',
            name: 'studio_id',
            label: 'Studio',
            type: 'select',
            defaultValue: undefined,
            options: studioOptions,
            parseAsNumber: true,
            sanitize: (value) => (value ? value : undefined),
            validation: z.preprocess(
                (value) => (value === '' || value === null ? undefined : value),
                z.number().int().positive(),
            ),
        },
        {
            id: 'status',
            name: 'status',
            label: 'Status',
            type: 'select',
            defaultValue: '',
            options: [
                { value: 'airing', label: 'airing' },
                { value: 'planned', label: 'planned' },
                { value: 'released', label: 'released' },
            ],
            validation: z
                .string()
                .refine(
                    (value) => ['airing', 'planned', 'released'].includes(value),
                    'Select a valid status',
                ),
        },
        {
            id: 'age_rating',
            name: 'age_rating',
            label: 'Age Rating',
            type: 'select',
            defaultValue: undefined,
            options: AGE_RATING_OPTIONS,
            sanitize: (value) => (value ? value : undefined),
            validation: z.preprocess(
                (value) => (value === '' || value === null ? undefined : value),
                z
                    .string()
                    .refine(
                        (value) => value === undefined || AGE_RATING_VALUES.includes(value),
                        'Select a valid age rating',
                    ),
            ),
        },
        {
            id: 'season',
            name: 'season_year',
            label: 'Season year',
            type: 'season',
            defaultValue: undefined,
            options: buildSeasonYearOptions(),
            parseAsNumber: true,
            emptyValue: '',
            validation: z.preprocess(
                (value) => (value === '' || value === null ? undefined : value),
                z.number().int().positive(),
            ),
            secondaryName: 'season',
            secondaryLabel: 'Season',
            secondaryOptions: SEASON_OPTIONS,
            secondaryEmptyValue: '',
            secondaryValidation: z
                .string()
                .refine(
                    (value) => ['winter', 'spring', 'summer', 'fall'].includes(value),
                    'Select a valid season',
                ),
        },
        {
            id: 'filter_ids',
            name: 'filter_ids',
            label: 'Filters',
            type: 'filters',
            defaultValue: [],
            validation: false,
            getValue: (item) =>
                Array.isArray(item?.filter_ids)
                    ? item.filter_ids
                    : Array.isArray(item?.filters)
                      ? item.filters.map((filter: { id: number }) => filter.id)
                      : [],
        },
        {
            id: 'image',
            name: 'image',
            label: 'Image',
            type: 'file',
            validation: z
                .instanceof(File)
                .optional()
                .or(z.null())
                .refine((f) => !f || f.size <= 8_000_000, 'Image must be <= 8MB')
                .refine((f) => !f || /^image\//.test(f.type), 'Only images'),
            previewUrl: (item) => (item?.featured_image ? imageUrl(item.featured_image) ?? null : null),
        },
    ];
};

const columns = [
    { label: 'Featured Image', key: 'featured_image', isImage: true, className: 'border p-4' },
    { label: 'Product Name', key: 'name', className: 'border w-90 p-4' },
    { label: 'Description', key: 'description', className: 'border p-4 w-1/3' },
    { label: 'Rate', key: 'rating', className: 'border p-4' },
    { label: 'Created Date', key: 'created_at', className: 'border p-4 text-center' },
    { label: 'Updated Date', key: 'updated_at', className: 'border p-4 text-center' },
    { label: 'Actions', key: 'actions', isAction: true, className: 'border p-4' },
];

const buildActions = (options?: { onVideoClick?: (row: AdminTableRow) => void }) => [
    {
        label: 'View',
        icon: 'Eye',
        className: 'cursor-pointer rounded-lg bg-sky-600 p-2 text-white hover:opacity-90',
    },
    {
        label: 'Video',
        icon: 'Clapperboard',
        method: 'button' as const,
        onClick: options?.onVideoClick,
        className: 'ms-2 cursor-pointer rounded-lg bg-amber-600 p-2 text-white hover:opacity-90',
    },
    {
        label: 'Edit',
        icon: 'Pencil',
        className: 'ms-2 cursor-pointer rounded-lg bg-green-600 p-2 text-white hover:opacity-90',
    },
    {
        label: 'Delete',
        icon: 'Trash',
        className: 'ms-2 cursor-pointer rounded-lg bg-red-600 p-2 text-white hover:opacity-90',
    },
];

export const buildAnimeTableConfig = (
    studioOptions: AdminFormFieldOption[] = [],
    options?: { onVideoClick?: (row: AdminTableRow) => void },
) => ({
    columns,
    actions: buildActions(options),
    formFields: buildFormFields(studioOptions),
});

export const animeTableConfig = {
    columns: [
        { label: 'Featured Image', key: 'featured_image', isImage: true, className: 'border p-4' },
        { label: 'Product Name', key: 'name', className: 'border w-90 p-4' },
        { label: 'Description', key: 'description', className: 'border p-4 w-1/3' },
        { label: 'Rate', key: 'rating', className: 'border p-4' },
        { label: 'Created Date', key: 'created_at', className: 'border p-4 text-center' },
        { label: 'Updated Date', key: 'updated_at', className: 'border p-4 text-center' },
        { label: 'Actions', key: 'actions', isAction: true, className: 'border p-4' },
    ],
    actions: buildActions(),
    formFields: buildFormFields([]),
};
