import type * as LucideIcons from 'lucide-react';
import type { ZodTypeAny } from 'zod';

export interface AdminTableColumn {
    label: string;
    key: string;
    isImage?: boolean;
    isAction?: boolean;
    isGallery?: boolean;
    className?: string;
    type?: string;
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

export type AdminFormFieldType = 'text' | 'textarea' | 'select' | 'file' | (string & {});

export interface AdminFormField {
    id: string;
    name: string;
    label: string;
    type: AdminFormFieldType;
    defaultValue?: unknown;
    getValue?: (item: Record<string, any>) => unknown;
    validation?: ZodTypeAny | false;
    previewUrl?: (item: Record<string, any>) => string | null;
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

export interface CustomAdminTableProps extends AdminTableProps {
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
