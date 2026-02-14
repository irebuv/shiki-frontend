import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import type { AdminFormField, AdminFormFieldOption } from '@/types/admin/adminTable';
import { useState } from 'react';

type SelectInputFieldProps = {
    field: AdminFormField;
    data: Record<string, any>;
    setData: (name: string, value: any) => void;
    readOnly: boolean;
};

export const SELECT_INPUT_DEFAULT_OPTIONS: AdminFormFieldOption[] = [
    { value: 11, label: '11' },
    { value: 12, label: '12' },
    { value: 13, label: '13' },
    { value: 24, label: '24' },
    { value: 25, label: '25' },
];

export const SELECT_INPUT_CUSTOM_VALUE = '__manual__';
export const SELECT_INPUT_UNSET_VALUE = '__unset__';

export default function SelectInputField({
    field,
    data,
    setData,
    readOnly,
}: SelectInputFieldProps) {
    const [manualMode, setManualMode] = useState(false);
    const options =
        field.options && field.options.length > 0 ? field.options : SELECT_INPUT_DEFAULT_OPTIONS;
    const rawValue = data[field.name];
    const normalizedRawValue = rawValue === undefined || rawValue === null ? '' : String(rawValue);
    const hasPredefinedValue = options.some((option) => String(option.value) === normalizedRawValue);
    const selectValue =
        manualMode
            ? SELECT_INPUT_CUSTOM_VALUE
            : normalizedRawValue === ''
            ? SELECT_INPUT_UNSET_VALUE
            : hasPredefinedValue
              ? normalizedRawValue
              : SELECT_INPUT_CUSTOM_VALUE;
    const showManualInput =
        manualMode || (selectValue === SELECT_INPUT_CUSTOM_VALUE && normalizedRawValue !== '');

    return (
        <div className="space-y-2">
            <Select
                value={selectValue}
                onValueChange={(value) => {
                    if (readOnly) return;

                    if (value === SELECT_INPUT_CUSTOM_VALUE) {
                        setManualMode(true);
                        if (hasPredefinedValue) {
                            setData(field.name, '');
                        }
                        return;
                    }

                    if (value === SELECT_INPUT_UNSET_VALUE) {
                        setManualMode(false);
                        setData(field.name, '');
                        return;
                    }

                    setManualMode(false);
                    const nextValue = field.parseAsNumber ? Number(value) : value;
                    setData(field.name, nextValue);
                }}
                disabled={readOnly}
            >
                <SelectTrigger>
                    <SelectValue placeholder={`Select ${field.label}`} />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value={SELECT_INPUT_UNSET_VALUE}>{`Select ${field.label}`}</SelectItem>
                    {options.map((option) => (
                        <SelectItem key={String(option.value)} value={String(option.value)}>
                            {option.label}
                        </SelectItem>
                    ))}
                    <SelectItem value={SELECT_INPUT_CUSTOM_VALUE}>
                        {field.manualOptionLabel ?? 'Enter manually'}
                    </SelectItem>
                </SelectContent>
            </Select>

            {showManualInput && (
                <Input
                    id={`${field.id}-manual`}
                    name={`${field.name}-manual`}
                    type={field.parseAsNumber ? 'number' : 'text'}
                    min={field.parseAsNumber ? 1 : undefined}
                    step={field.parseAsNumber ? 1 : undefined}
                    value={normalizedRawValue}
                    readOnly={readOnly}
                    placeholder={
                        field.manualInputPlaceholder ?? `Enter ${field.label.toLowerCase()}`
                    }
                    onChange={(e) => {
                        if (readOnly) return;
                        setManualMode(true);
                        const nextRaw = e.target.value;
                        if (!field.parseAsNumber) {
                            setData(field.name, nextRaw);
                            return;
                        }
                        if (nextRaw === '') {
                            setData(field.name, '');
                            return;
                        }
                        const nextNumber = Number(nextRaw);
                        if (Number.isNaN(nextNumber)) return;
                        setData(field.name, nextNumber);
                    }}
                />
            )}
        </div>
    );
}
