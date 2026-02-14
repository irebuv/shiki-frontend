import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { DESCRIPTION_LINE_OPTIONS } from '@/lib/descriptionLines';

type FieldLabelProps = {
    field: { id: string; name: string; label: string };
    descriptionRows: number;
    setDescriptionRows: (next: number) => void;
};

export default function FieldLabel({
    field,
    descriptionRows,
    setDescriptionRows,
}: FieldLabelProps) {
    if (field.name === 'description') {
        return (
            <div className="flex items-center justify-between gap-3 py-1">
                <Label htmlFor={field.id}>{field.label}</Label>
                <Select
                    value={String(descriptionRows)}
                    onValueChange={(v) => setDescriptionRows(Number(v))}
                >
                    <SelectTrigger className="h-8 w-16">
                        <SelectValue placeholder="Rows" />
                    </SelectTrigger>
                    <SelectContent>
                        {DESCRIPTION_LINE_OPTIONS.filter((v) => v !== 'all').map((n) => (
                            <SelectItem key={n} value={String(n)}>
                                {n}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        );
    }

    return <Label htmlFor={field.id}>{field.label}</Label>;
}
