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
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import React, { useEffect, useMemo, useState } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { DESCRIPTION_LINE_OPTIONS } from '@/lib/descriptionLines';

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
}) {
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [showPreview, setShowPreview] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date>();
    const [dragActive, setDragActive] = useState(false);
    const [descriptionRows, setDescriptionRows] = useLocalStorage<number>(
        'modal.description.rows',
        6,
    );

    const fileFieldName = useMemo(() => {
        const fileField = fields?.find((field) => field.type === 'file');
        return fileField?.name ?? null;
    }, [fields]);

    const fileValue = fileFieldName ? data?.[fileFieldName] : null;
    const externalPreviewUrl = fileFieldName ? filePreviewUrls?.[fileFieldName] : null;

    useEffect(() => {
        if (fileValue instanceof File) {
            const url = URL.createObjectURL(fileValue);
            setPreviewUrl(url);
            setShowPreview(true);
            return () => URL.revokeObjectURL(url);
        }
        if (externalPreviewUrl) {
            setPreviewUrl(externalPreviewUrl);
            setShowPreview(true);
            return;
        }
        setShowPreview(false);
    }, [fileValue, externalPreviewUrl]);

    //drag & drop
    const handleDrag = (e: React.DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
        if (e.type === 'dragleave') setDragActive(false);
    };

    const handleDrop = (e: React.DragEvent<HTMLLabelElement>, fieldName: string) => {
        if (readOnly) return;
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        const file = e.dataTransfer.files?.[0];
        if (file && file.type.startsWith('image/')) {
            setData(fieldName, file);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange} modal>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    {description && <DialogDescription>{description}</DialogDescription>}
                </DialogHeader>

                <form onSubmit={onSubmit} className="space-y-4">
                    {fields.map((f) => (
                        <div key={f.id}>
                            {f.name === 'description' ? (
                                <div className="flex items-center justify-between gap-3 py-1">
                                    <Label htmlFor={f.id}>{f.label}</Label>
                                    <Select
                                        value={String(descriptionRows)}
                                        onValueChange={(v) => setDescriptionRows(Number(v))}
                                    >
                                        <SelectTrigger className="h-8 w-16">
                                            <SelectValue placeholder="Rows" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {DESCRIPTION_LINE_OPTIONS.filter(
                                                (v) => v !== 'all',
                                            ).map((n) => (
                                                <SelectItem key={n} value={String(n)}>
                                                    {n}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            ) : (
                                <Label htmlFor={f.id}>{f.label}</Label>
                            )}
                            {f.type === 'textarea' ? (
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
                            ) : f.type === 'file' ? (
                                <div className="flex flex-col space-y-3">
                                    <Label
                                        htmlFor={f.id}
                                        onDragEnter={readOnly ? undefined : handleDrag}
                                        onDragOver={readOnly ? undefined : handleDrag}
                                        onDragLeave={readOnly ? undefined : handleDrag}
                                        onDrop={readOnly ? undefined : (e) => handleDrop(e, f.name)}
                                        className={`relative w-full cursor-pointer rounded-lg border-2
                                                    border-dashed p-5 text-center text-sm transition
                                                    ${
                                                        dragActive
                                                            ? 'border-blue-500 bg-blue-50 text-chart-1'
                                                            : 'border-gray-400 bg-background text-foreground hover:border-chart-1 hover:text-chart-1'
                                                    } ${readOnly ? 'cursor-not-allowed opacity-70' : ''}`}
                                    >
                                        <Input
                                            id={f.id}
                                            name={f.name}
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            disabled={readOnly}
                                            onChange={(e) => {
                                                if (readOnly) return;
                                                const file = e.target.files?.[0];
                                                if (file && file.type.startsWith('image/')) {
                                                    setData(f.name, file);
                                                }
                                            }}
                                        />

                                        {/* If file was chosen */}
                                        {data[f.name] ? (
                                            <span className="block text-ring truncate max-w-[200px] mx-auto">
                                                {data[f.name]?.name}
                                            </span>
                                        ) : (
                                            <>
                                                <span className="block">
                                                    Click or drag image here
                                                </span>
                                                <span className="block text-sm text-gray-400 mt-1">
                                                    PNG / JPG, up to 8MB
                                                </span>
                                            </>
                                        )}
                                    </Label>

                                    {/* Preview for image */}
                                    <div
                                        className={cn(
                                            'overflow-hidden transition-all duration-300 ease-in-out',
                                            showPreview ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0',
                                        )}
                                        onTransitionEnd={() => {
                                            if (!showPreview) {
                                                setPreviewUrl(null);
                                            }
                                        }}
                                    >
                                    {previewUrl && (
                                        <div className="relative inline-block group cursor-pointer self-start">
                                            <img
                                                src={previewUrl}
                                                    alt="Preview"
                                                    className="rounded-lg border object-contain dark:bg-muted-foreground/40 max-h-36 transition group-hover:opacity-75 p-2"
                                                />
                                                {!readOnly && (
                                                    <span
                                                        onClick={() => {
                                                            setData(f.name, null);
                                                            onClearPreview?.(f.name);
                                                            const input = document.getElementById(
                                                                f.id,
                                                            ) as HTMLInputElement | null;
                                                            if (input) input.value = '';
                                                        }}
                                                        className="absolute inset-0 flex items-center justify-center text-foreground text-center
                                                 text-sm bg-background/40 rounded-lg opacity-0 group-hover:opacity-100 transition"
                                                    >
                                                        Click to remove
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
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
                            )}

                            {errors && errors[f.name] && <InputError message={errors?.[f.name]} />}
                        </div>
                    ))}
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button" variant="outline">
                                Cancel
                            </Button>
                        </DialogClose>
                        {!readOnly && (
                            <Button type="submit" disabled={processing || !isValid || uploadingImage}>
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
