import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import * as LucidIcons from "lucide-react";
import type { AdminTableActionButtonsProps } from "@/types/admin/adminTable";

export function AdminTableActionButtons({
    actions,
    isModal,
    row,
    onView,
    onEdit,
    onDelete,
    deleteUrl,
}: AdminTableActionButtonsProps) {
    return (
        <div className="flex justify-center">
            {actions.map((action, index) => {
                const IconComponent = LucidIcons[action.icon] as React.ElementType;
                if (isModal) {
                    if (action.label === "View") {
                        return (
                            <Button
                                key={index}
                                className={cn("w-10 h-10", action.className)}
                                onClick={() => onView?.(row)}
                            >
                                <IconComponent size={18} />
                            </Button>
                        );
                    }
                    if (action.label === "Edit") {
                        return (
                            <Button
                                key={index}
                                className={cn("w-10 h-10", action.className)}
                                onClick={() => onEdit?.(row)}
                            >
                                <IconComponent size={18} />
                            </Button>
                        );
                    }
                }
                if (action.label === "Delete") {
                    const deleteHref =
                        action.href?.(row.id, row) ?? deleteUrl?.(row.id, row);
                    if (!deleteHref) return null;

                    return (
                        <Button
                            key={index}
                            className={cn("w-10 h-10", action.className)}
                            onClick={() => onDelete?.(row.id, deleteHref)}
                        >
                            <IconComponent size={18} />
                        </Button>
                    );
                }
                const href = action.href?.(row.id, row);
                if (!href) return null;

                return (
                    <Link key={index} to={href} className={action.className}>
                        <IconComponent size={18} />
                    </Link>
                );
            })}
        </div>
    );
}
