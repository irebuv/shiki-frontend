import { DescriptionLinesSelect } from '@/components/custom/DescriptionLinesSelect';
import { ExpandableText } from '@/components/custom/ExpandableText';
import { useDescriptionLines } from '@/hooks/useDescriptionLines';
import { DescriptionLines } from '@/lib/descriptionLines';
import { imageUrl } from '@/lib/imageUrl';
import { AdminTableActionButtons } from './AdminTableActionButtons';
import type { AdminTableProps } from '@/types/admin/adminTable';
import { Link } from 'react-router-dom';

export default function AdminTable({
    actions,
    isModal,
    columns,
    onView,
    onEdit,
    onDelete,
    data,
    from,
    deleteUrl,
}: AdminTableProps) {
    const { lines, setLines } = useDescriptionLines<DescriptionLines>(5);
    return (
        <div className="size-full overflow-auto rounded-lg border bg-background shadow-sm">
            <table className="w-full table-auto border-separate border-spacing-0 bg-background">
                <thead className="sticky top-0 z-10 bg-background shadow-sm">
                    <tr className="text-foreground">
                        <th className="border p-4 text-center">#</th>
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
                                    {(from ?? 0) + index + 1}
                                </td>

                                {columns.map((col) => (
                                    <td
                                        key={col.key}
                                        className={`border-b border-r px-4 py-2 align-top ${
                                            col.className ?? ''
                                        }`}
                                    >
                                        {col.render ? (
                                            col.render(row)
                                        ) : col.isImage ? (
                                            <div className="flex justify-center">
                                                {(() => {
                                                    const src = imageUrl(row[col.key]);
                                                    const href = col.imageHref?.(row);

                                                    if (!src) {
                                                        return (
                                                            <div className="text-sm opacity-60">
                                                                No image
                                                            </div>
                                                        );
                                                    }

                                                    const imageNode = (
                                                        <img
                                                            src={src}
                                                            alt={row[col.label]}
                                                            className="block transition-opacity group-hover:opacity-90"
                                                            width={100}
                                                        />
                                                    );

                                                    return href ? (
                                                        <Link
                                                            to={href}
                                                            className="group cursor-pointer rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                                            title="Open anime page"
                                                        >
                                                            {imageNode}
                                                        </Link>
                                                    ) : (
                                                        imageNode
                                                    );
                                                })()}
                                            </div>
                                        ) : col.isAction ? (
                                            <AdminTableActionButtons
                                                actions={actions}
                                                isModal={isModal}
                                                row={row}
                                                onView={onView}
                                                onEdit={onEdit}
                                                onDelete={onDelete}
                                                deleteUrl={deleteUrl}
                                            />
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
}
