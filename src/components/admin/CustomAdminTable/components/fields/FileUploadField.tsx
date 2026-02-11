import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import type { AdminFormField } from '@/types/admin/adminTable';
import React, { useEffect, useState } from 'react';

type FileUploadFieldProps = {
    field: AdminFormField;
    value: unknown;
    readOnly: boolean;
    open: boolean;
    setData: (name: string, value: any) => void;
    externalPreviewUrl?: string | null;
    onClearPreview?: (fieldName: string) => void;
};

export default function FileUploadField({
    field,
    value,
    readOnly,
    open,
    setData,
    externalPreviewUrl,
    onClearPreview,
}: FileUploadFieldProps) {
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [showPreview, setShowPreview] = useState(false);
    const [dragActive, setDragActive] = useState(false);

    useEffect(() => {
        if (value instanceof File) {
            const url = URL.createObjectURL(value);
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
    }, [value, externalPreviewUrl]);

    const handleDrag = (e: React.DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
        if (e.type === 'dragleave') setDragActive(false);
    };

    const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
        if (readOnly) return;
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        const file = e.dataTransfer.files?.[0];
        if (file && file.type.startsWith('image/')) {
            setData(field.name, file);
        }
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLElement>) => {
        if (readOnly) return;
        const items = e.clipboardData?.items;
        if (!items) return;
        const imageItem = Array.from(items).find((item) => item.type.startsWith('image/'));
        if (!imageItem) return;
        const file = imageItem.getAsFile();
        if (!file) return;
        e.preventDefault();
        setData(field.name, file);
    };

    useEffect(() => {
        if (!open || readOnly) return;
        const onPaste = (e: ClipboardEvent) => {
            const items = e.clipboardData?.items;
            if (!items) return;
            const imageItem = Array.from(items).find((item) => item.type.startsWith('image/'));
            if (!imageItem) return;
            const file = imageItem.getAsFile();
            if (!file) return;
            e.preventDefault();
            setData(field.name, file);
        };
        window.addEventListener('paste', onPaste);
        return () => window.removeEventListener('paste', onPaste);
    }, [open, readOnly, field.name, setData]);

    return (
        <div className="flex flex-col space-y-3">
            <Label
                htmlFor={field.id}
                onDragEnter={readOnly ? undefined : handleDrag}
                onDragOver={readOnly ? undefined : handleDrag}
                onDragLeave={readOnly ? undefined : handleDrag}
                onDrop={readOnly ? undefined : handleDrop}
                onPaste={readOnly ? undefined : handlePaste}
                tabIndex={readOnly ? -1 : 0}
                className={`relative w-full cursor-pointer rounded-lg border-2
                        border-dashed p-5 text-center text-sm transition
                        ${
                            dragActive
                                ? 'border-blue-500 bg-blue-50 text-chart-1'
                                : 'border-gray-400 bg-background text-foreground hover:border-chart-1 hover:text-chart-1'
                        } ${readOnly ? 'cursor-not-allowed opacity-70' : ''}`}
            >
                <Input
                    id={field.id}
                    name={field.name}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={readOnly}
                    onChange={(e) => {
                        if (readOnly) return;
                        const file = e.target.files?.[0];
                        if (file && file.type.startsWith('image/')) {
                            setData(field.name, file);
                        }
                    }}
                />

                {value ? (
                    <span className="mx-auto block max-w-[200px] truncate text-ring">
                        {(value as File)?.name}
                    </span>
                ) : (
                    <>
                        <span className="block">Click or drag image here</span>
                        <span className="mt-1 block text-sm text-gray-400">
                            PNG / JPG, up to 8MB
                        </span>
                        <span className="mt-1 block text-xs text-muted-foreground">
                            Tip: press Ctrl+V to paste from clipboard
                        </span>
                    </>
                )}
            </Label>

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
                    <div className="group relative inline-block cursor-pointer self-start">
                        <img
                            src={previewUrl}
                            alt="Preview"
                            className="max-h-36 rounded-lg border object-contain p-2 transition group-hover:opacity-75 dark:bg-muted-foreground/40"
                        />
                        {!readOnly && (
                            <span
                                onClick={() => {
                                    setData(field.name, null);
                                    onClearPreview?.(field.name);
                                    const input = document.getElementById(field.id) as HTMLInputElement | null;
                                    if (input) input.value = '';
                                }}
                                className="absolute inset-0 flex items-center justify-center rounded-lg bg-background/40 text-center text-sm text-foreground opacity-0 transition group-hover:opacity-100"
                            >
                                Click to remove
                            </span>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
