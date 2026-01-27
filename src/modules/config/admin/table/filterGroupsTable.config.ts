import { z } from 'zod';
import type { AdminFormField } from '@/types/admin/adminTable';
import { createElement } from 'react';
import { FilterGroupFiltersCell } from '@/components/admin/AdminFilters/FilterGroupFiltersCell';

type FilterListItem = {
    id?: number;
    title?: string;
    visible?: boolean;
};

const filterItemSchema = z.object({
    id: z.number().int().positive().optional(),
    title: z.string().trim().min(1, 'Filter title is required').max(120, 'Max 120 chars'),
    visible: z.boolean().optional(),
});

const sanitizeFilterList = (value: unknown): FilterListItem[] => {
    const list = Array.isArray(value) ? (value as FilterListItem[]) : [];
    return list
        .map((item) => ({
            id: item.id,
            title: (item.title ?? '').trim(),
            visible: item.visible ?? true,
        }))
        .filter((item) => item.title !== '');
};

export const buildFilterGroupsTableConfig = (params: {
    onDeleteFilter: (filterId: number) => void;
}) => {
    const { onDeleteFilter } = params;

    const formFields: AdminFormField[] = [
        {
            id: 'title',
            name: 'title',
            label: 'Group name',
            type: 'text',
            defaultValue: '',
            validation: z.string().trim().min(2, 'Min 2 chars').max(120, 'Max 120 chars'),
        },
        {
            id: 'filters',
            name: 'filters',
            label: 'Filters',
            type: 'filter-list',
            defaultValue: [{ title: '', visible: true }],
            sanitize: sanitizeFilterList,
            validation: z.array(filterItemSchema).optional(),
            getValue: (item) => (Array.isArray(item?.filters) ? item.filters : []),
        },
    ];

    return {
        columns: [
            { label: 'Title', key: 'title', className: 'border p-4 w-64' },
            {
                label: 'Filters',
                key: 'filters',
                className: 'border p-4',
                render: (row) => createElement(FilterGroupFiltersCell, { row, onDeleteFilter }),
            },
            { label: 'Actions', key: 'actions', isAction: true, className: 'border p-4 w-40' },
        ],
        actions: [
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
        ],
        formFields,
    };
};
