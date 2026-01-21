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
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import React, { useEffect, useState } from 'react';

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
}) {
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [showPreview, setShowPreview] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date>();
    const [dragActive, setDragActive] = useState(false);

    useEffect(() => {
        if (!data.image) {
            setShowPreview(false);
            return;
        }
        const url = URL.createObjectURL(data.image as File);
        setPreviewUrl((prev) => {
            if (prev) URL.revokeObjectURL(prev);
            return url;
        });
        setShowPreview(true);
    }, [data.image]);

    useEffect(() => {
        return () => {
            if (previewUrl) URL.revokeObjectURL(previewUrl);
        };
    }, [previewUrl]);

    //drag & drop
    const handleDrag = (e: React.DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
        if (e.type === 'dragleave') setDragActive(false);
    };

    const handleDrop = (e: React.DragEvent<HTMLLabelElement>, fieldName: string) => {
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
                            <Label htmlFor={f.id}>{f.label}</Label>
                            {f.type === 'textarea' ? (
                                <Textarea></Textarea>
                            ) : f.type === 'file' ? (
                                <div className="flex flex-col space-y-3">
                                    <Label
                                        htmlFor={f.id}
                                        onDragEnter={handleDrag}
                                        onDragOver={handleDrag}
                                        onDragLeave={handleDrag}
                                        onDrop={(e) => handleDrop(e, f.name)}
                                        className={`relative w-full cursor-pointer rounded-lg border-2
                                                    border-dashed p-5 text-center text-sm transition
                                                    ${
                                                        dragActive
                                                            ? 'border-blue-500 bg-blue-50 text-chart-1'
                                                            : 'border-gray-400 bg-background text-foreground hover:border-chart-1 hover:text-chart-1'
                                                    }`}
                                    >
                                        <Input
                                            id={f.id}
                                            name={f.name}
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={(e) => {
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
                                                <span
                                                    onClick={() => {
                                                        setData(f.name, null);
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
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <Input
                                    id={f.id}
                                    name={f.name}
                                    value={data[f.name] ?? ''}
                                    onChange={(e) => {
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
                        <Button type="submit" disabled={processing || !isValid || uploadingImage}>
                            {processing
                                ? 'Saving...'
                                : uploadingImage
                                  ? 'Uploading image...'
                                  : submitLabel}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
