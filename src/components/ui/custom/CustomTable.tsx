import { ExpandableText } from '@/components/custom/ExpandableText';
import { useDescriptionLines } from '@/hooks/useDescriptionLines';
import { imageUrl } from '@/lib/imageUrl';
import * as LucidIcons from 'lucide-react';
import { DescriptionLinesSelect } from '@/components/custom/DescriptionLinesSelect';
import { type DescriptionLines } from '@/lib/descriptionLines';
import { useState } from 'react';

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
    // accept Lucide icon keys or plain string names
    icon: keyof typeof LucidIcons | string;
    route?: string;
    className?: string;
}

interface TableRow {
    [key: string]: any;
}

interface CustomTableProps {
    columns: TableColumn[];
    actions: ActionConfig[];
    data: TableRow[];
    from?: number;
    onDelete?: (id: number, route: string) => void;
    onView?: (row: TableRow) => void;
    onEdit?: (row: TableRow) => void;
    isModal?: boolean;
}

export const CustomTable = ({
    columns,
    actions,
    data,
    from,
    onDelete,
    onView,
    onEdit,
    isModal,
}: CustomTableProps) => {
    const renderActionButtons = (row: TableRow) => {
        return <div className="flex justify-center">buttons</div>;
    };
    const { lines, setLines } = useDescriptionLines<DescriptionLines>(5);
    
    return (
        <div className="w-full overflow-auto rounded-lg border bg-background shadow-sm">
            <table className="w-full table-auto border-separate border-spacing-0 bg-background">
                <thead className="sticky top-0 z-10 bg-background shadow-sm">
                    <tr className="text-foreground">
                        <th className="border p-4">#</th>
                        {columns.map((column) => (
                            <th
                                key={column.key}
                                className={`border-b border-r p-4 ${column.className ?? ''}`}
                            >
                                {column.key === 'description' ? (
                                    <div className="flex items-center justify-center gap-2">
                                        <span>{column.label}</span>
                                        <DescriptionLinesSelect lines={lines} setLines={setLines} />
                                    </div>
                                ) : (
                                    <span>{column.label}</span>
                                )}
                            </th>
                        ))}
                    </tr>
                </thead>

                <tbody>
                    {data?.length ? (
                        data.map((row, index) => (
                            <tr key={index} className="align-top">
                                <td className="border-b border-r px-4 py-2 text-center align-top">
                                    {index + 1}
                                </td>

                                {columns.map((col) => (
                                    <td
                                        key={col.key}
                                        className={`border-b border-r px-4 py-2 align-top ${
                                            col.className ?? ''
                                        }`}
                                    >
                                        {col.isImage ? (
                                            <div className="flex justify-center">
                                                {row[col.key] ? (
                                                    <img
                                                        width={100}
                                                        className="block"
                                                        src={imageUrl(row[col.key])}
                                                        alt="Image"
                                                    />
                                                ) : (
                                                    <div className="text-sm opacity-60">
                                                        No image
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <ExpandableText text={row[col.key]} lines={lines} />
                                        )}
                                    </td>
                                ))}
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td
                                colSpan={columns.length + 1}
                                className="py-4 text-center font-bold text-destructive"
                            >
                                No data found!
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};
