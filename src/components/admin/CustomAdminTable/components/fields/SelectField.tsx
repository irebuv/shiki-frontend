import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import type { AdminFormField } from '@/types/admin/adminTable';

type SelectFieldProps = {
    field: AdminFormField;
    data: Record<string, any>;
    setData: (name: string, value: any) => void;
    readOnly: boolean;
};

export default function SelectField({ field, data, setData, readOnly }: SelectFieldProps) {
    return (
        <Select
            value={
                data[field.name] === undefined || data[field.name] === null
                    ? (field.emptyValue ?? undefined)
                    : String(data[field.name])
            }
            onValueChange={(value) => {
                if (readOnly) return;
                if (field.emptyValue && value === field.emptyValue) {
                    setData(field.name, undefined);
                    return;
                }
                const nextValue = field.parseAsNumber ? Number(value) : value;
                setData(field.name, nextValue);
            }}
            disabled={readOnly}
        >
            <SelectTrigger>
                <SelectValue placeholder={`Select ${field.label}`} />
            </SelectTrigger>
            <SelectContent>
                {(field.options ?? []).map((option) => (
                    <SelectItem key={String(option.value)} value={String(option.value)}>
                        {option.label}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
