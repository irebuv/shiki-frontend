import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import InputError from '@/components/ui/input-error';
import { Textarea } from '@/components/ui/textarea';
import React from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import type { AdminFormField } from '@/types/admin/adminTable';
import { AnimeAdminFilters } from '../../AdminFilters/AnimeAdminFilters';
import FilterListField from './fields/FilterListField';
import SeasonField from './fields/SeasonField';
import SelectInputField from './fields/SelectInputField';
import FileUploadField from './fields/FileUploadField';
import FieldLabel from './fields/FieldLabel';
import SelectField from './fields/SelectField';

export default function CustomModalForm({
    open,
    onOpenChange,
    title,
    description,
    fields,
    data,
    setData,
    processing,
    uploadingImage,
    errors,
    onSubmit,
    submitLabel = 'Submit',
    isValid,
    filePreviewUrls,
    onClearPreview,
    readOnly = false,
    filters,
}) {
    const [descriptionRows, setDescriptionRows] = useLocalStorage<number>(
        'modal.description.rows',
        6,
    );

    const renderFieldContent = (f: AdminFormField) => {
        switch (f.type) {
            case 'textarea':
                return (
                    <Textarea
                        id={f.id}
                        name={f.name}
                        value={data[f.name] ?? ''}
                        readOnly={readOnly}
                        rows={f.name === 'description' ? descriptionRows : undefined}
                        onChange={(e) => {
                            if (readOnly) return;
                            setData(f.name, e.target.value);
                        }}
                    />
                );
            case 'select':
                return <SelectField field={f} data={data} setData={setData} readOnly={readOnly} />;
            case 'select-input':
                return (
                    <SelectInputField
                        field={f}
                        data={data}
                        setData={setData}
                        readOnly={readOnly}
                    />
                );
            case 'season':
                if (!f.secondaryName) return null;
                return <SeasonField field={f} data={data} setData={setData} readOnly={readOnly} />;
            case 'filter-list':
                return (
                    <div className="space-y-2">
                        <FilterListField field={f} data={data} setData={setData} readOnly={readOnly} />
                        {!readOnly && (
                            <p className="text-xs text-muted-foreground">
                                Fill a row to automatically add the next one.
                            </p>
                        )}
                    </div>
                );
            case 'file':
                return (
                    <FileUploadField
                        field={f}
                        value={data[f.name]}
                        readOnly={readOnly}
                        open={open}
                        setData={setData}
                        externalPreviewUrl={filePreviewUrls?.[f.name]}
                        onClearPreview={onClearPreview}
                    />
                );
            case 'filters':
                return (
                    <AnimeAdminFilters
                        filters={filters}
                        value={Array.isArray(data?.[f.name]) ? data[f.name] : []}
                        onChange={(next) => {
                            if (readOnly) return;
                            setData(f.name, next);
                        }}
                        readOnly={readOnly}
                    />
                );
            default:
                return (
                    <Input
                        id={f.id}
                        name={f.name}
                        value={data[f.name] ?? ''}
                        readOnly={readOnly}
                        onChange={(e) => {
                            if (readOnly) return;
                            setData(f.name, e.target.value);
                        }}
                    />
                );
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange} modal>
            <DialogContent className="sm:max-w-3/5 max-h-[95vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    {description && <DialogDescription>{description}</DialogDescription>}
                </DialogHeader>

                <form onSubmit={onSubmit} className="flex min-h-0 flex-1 flex-col gap-4">
                    <div className="grid min-h-0 flex-1 gap-6 overflow-y-auto px-2">
                        {fields.map((f) => (
                            <div key={f.id}>
                                <FieldLabel
                                    field={f}
                                    descriptionRows={descriptionRows}
                                    setDescriptionRows={setDescriptionRows}
                                />
                                {renderFieldContent(f)}

                                {errors && errors[f.name] && (
                                    <InputError message={errors?.[f.name]} />
                                )}
                            </div>
                        ))}
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button" variant="outline">
                                Cancel
                            </Button>
                        </DialogClose>
                        {!readOnly && (
                            <Button
                                type="submit"
                                disabled={processing || !isValid || uploadingImage}
                            >
                                {processing
                                    ? 'Saving...'
                                    : uploadingImage
                                      ? 'Uploading image...'
                                      : submitLabel}
                            </Button>
                        )}
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
