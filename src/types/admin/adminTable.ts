import type * as LucideIcons from 'lucide-react';

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

export interface AdminTableProps {
    columns: AdminTableColumn[];
    actions: AdminTableActionConfig[];
    data: AdminTableRow[];
    from?: number;
    onDelete?: (id: number, route: string) => void;
    onView?: (row: AdminTableRow) => void;
    onEdit?: (row: AdminTableRow) => void;
    isModal?: boolean;
}

export interface AdminTableActionButtonsProps {
    actions: AdminTableActionConfig[];
    isModal?: boolean;
    row: AdminTableRow;
    onView?: (row: AdminTableRow) => void;
    onEdit?: (row: AdminTableRow) => void;
    onDelete?: (id: number, route: string) => void;
}
