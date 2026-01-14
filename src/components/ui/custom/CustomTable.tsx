
import * as LucidIcons from 'lucide-react';

interface TableColumn {
    label: string;
    key: string;
    isImage?: boolean;
    isAction?: boolean;
    isGallery?: boolean;
    className?: string;
    type?: string;
}

interface ActionConfig {
    label: string;
    icon: keyof typeof LucidIcons;
    route: string;
    className?: string;
}

interface TableRow {
    [key: string]: any;
}

interface CustomTableProps {
    columns?: TableColumn[];
    actions?: ActionConfig[];
    data?: TableRow[];
    from?: number;
    onDelete?: (id: number, route: string) => void;
    onView?: (row: TableRow) => void;
    onEdit?: (row: TableRow) => void;
    isModal?: boolean;
}

export const CustomTable = ({columns, actions, data, from, onDelete, onView, onEdit, isModal}: CustomTableProps) => {

    const renderActionButtons = (row: TableRow) => {
        return (
            <div className='flex justify-center'>buttons</div>
        );
    };

    return (
        <div className='overflow-hidden rounded-lg border bg-background shadow-sm'>
            <table className='w-full table-auto'>
                <thead>
                    <tr className='bg-background text-foreground'>
                        <th className='border p-4'>#</th>
                    
                    </tr>
                </thead>
            </table>
        </div>
    )
}