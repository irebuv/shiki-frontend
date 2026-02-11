import type * as LucideIcons from 'lucide-react';
import type { ZodTypeAny } from 'zod';
import type { ReactNode } from 'react';

export interface AdminTableColumn {
    label: string;
    key: string;
    isImage?: boolean;
    isAction?: boolean;
    isGallery?: boolean;
    className?: string;
    type?: string;
    render?: (row: AdminTableRow) => ReactNode;
}

export interface AdminTableRow {
    id: number;
    [key: string]: any;
}

export interface AdminTableActionConfig {
    label: 'View' | 'Edit' | 'Delete' | string;
    icon: keyof typeof LucideIcons | string;
    href?: (id: number, row: AdminTableRow) => string;
    className?: string;
    permission?: string;
    onClick?: (row: AdminTableRow) => void;
    method?: 'link' | 'delete' | 'button';
}

export type AdminFormFieldType =
    | 'text'
    | 'textarea'
    | 'select'
    | 'select-input'
    | 'file'
    | 'filters'
    | 'filter-list'
    | 'season'
    | (string & {});

export interface AdminFormFieldOption {
    value: string | number;
    label: string;
}

export interface AdminFormField {
    id: string;
    name: string;
    label: string;
    type: AdminFormFieldType;
    defaultValue?: unknown;
    getValue?: (item: Record<string, any>) => unknown;
    validation?: ZodTypeAny | false;
    previewUrl?: (item: Record<string, any>) => string | null;
    options?: AdminFormFieldOption[];
    manualOptionLabel?: string;
    manualInputPlaceholder?: string;
    parseAsNumber?: boolean;
    emptyValue?: string;
    sanitize?: (value: unknown) => unknown;
    secondaryName?: string;
    secondaryLabel?: string;
    secondaryOptions?: AdminFormFieldOption[];
    secondaryParseAsNumber?: boolean;
    secondaryEmptyValue?: string;
    secondarySanitize?: (value: unknown) => unknown;
    secondaryValidation?: ZodTypeAny | false;
}

export interface AdminTableProps {
    columns: AdminTableColumn[];
    actions: AdminTableActionConfig[];
    data: AdminTableRow[];
    from?: number;
    onDelete?: (id: number, route: string) => void;
    onView?: (row: AdminTableRow) => void;
    onEdit?: (row: AdminTableRow) => void;
    isModal?: boolean;
    deleteUrl?: (id: number, row: AdminTableRow) => string;
}

export interface CustomAdminTableProps {
    columns: AdminTableColumn[];
    actions: AdminTableActionConfig[];
    data: AdminTableRow[];
    from?: number;
    isModal?: boolean;
    deleteUrl?: (id: number, row: AdminTableRow) => string;
    modalTitle?: string;
    modalDescription?: string;
    formFields: AdminFormField[];
    refetch?: () => void;
    createUrl: string;
    updateUrl?: (id: number) => string;
    updateMethod?: 'put' | 'patch';
    imageUploadUrl?: (id: number) => string;
    createLabel?: string;
    getCreatedId?: (created: any) => number | undefined;
    filters?: Record<string, { id: number; title: string; visible?: boolean }[]> | null;
}

export interface AdminTableActionButtonsProps {
    actions: AdminTableActionConfig[];
    isModal?: boolean;
    row: AdminTableRow;
    onView?: (row: AdminTableRow) => void;
    onEdit?: (row: AdminTableRow) => void;
    onDelete?: (id: number, route: string) => void;
    deleteUrl?: (id: number, row: AdminTableRow) => string;
}
