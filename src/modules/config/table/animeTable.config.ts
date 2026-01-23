import { z } from 'zod';
import type { AdminFormField } from '@/types/admin/adminTable';
import { imageUrl } from '@/lib/imageUrl';

const formFields: AdminFormField[] = [
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
        validation: z.string().optional().or(z.literal('')),
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
        previewUrl: (item) => (item?.featured_image ? imageUrl(item.featured_image) : null),
    },
];

export const animeTableConfig = {
    modalTitle: 'Modal title',
    modalDescription: 'Modal description',
    columns: [
        { label: 'Featured Image', key: 'featured_image', isImage: true, className: 'border p-4' },
        { label: 'Gallery', key: 'gallery', isGallery: true, className: 'border p-4' },
        { label: 'Product Name', key: 'name', className: 'border w-90 p-4' },
        { label: 'Description', key: 'description', className: 'border p-4 w-1/3' },
        { label: 'Rate', key: 'rating', className: 'border p-4' },
        { label: 'Created Date', key: 'created_at', className: 'border p-4 text-center' },
        { label: 'Actions', key: 'actions', isAction: true, className: 'border p-4' },
    ],
    actions: [
        {
            label: 'View',
            icon: 'Eye',
            className: 'cursor-pointer rounded-lg bg-sky-600 p-2 text-white hover:opacity-90',
        },
        {
            label: 'Edit',
            icon: 'Pencil',
            className:
                'ms-2 cursor-pointer rounded-lg bg-green-600 p-2 text-white hover:opacity-90',
        },
        {
            label: 'Delete',
            icon: 'Trash',
            className: 'ms-2 cursor-pointer rounded-lg bg-red-600 p-2 text-white hover:opacity-90',
        },
    ],
    formFields,
};
