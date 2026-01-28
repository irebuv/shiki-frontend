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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { DESCRIPTION_LINE_OPTIONS } from '@/lib/descriptionLines';
import { AnimeAdminFilters } from '../../AdminFilters/AnimeAdminFilters';
import { AnimatePresence, LayoutGroup, motion } from 'framer-motion';

type FilterListItem = {
    id?: number;
    title?: string;
    visible?: boolean;
    clientId?: string;
};

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
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [showPreview, setShowPreview] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date>();
    const [dragActive, setDragActive] = useState(false);
    const [descriptionRows, setDescriptionRows] = useLocalStorage<number>(
        'modal.description.rows',
        6,
    );
    const filterClientIdCounterRef = useRef(0);
    const placeholderClientIdsRef = useRef<Record<string, string>>({});
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

    const nextFilterClientId = () => {
        filterClientIdCounterRef.current += 1;
        return `tmp-filter-${filterClientIdCounterRef.current}`;
    };

    const ensurePlaceholderClientId = (fieldName: string, nonBlank: FilterListItem[]) => {
        const current = placeholderClientIdsRef.current[fieldName];
        if (!current || nonBlank.some((item) => item.clientId === current)) {
            placeholderClientIdsRef.current[fieldName] = nextFilterClientId();
        }
        return placeholderClientIdsRef.current[fieldName];
    };

    const normalizeFilterList = (value: unknown, fieldName: string): FilterListItem[] => {
        const list = Array.isArray(value) ? (value as FilterListItem[]) : [];

        const withStableIds = list.map((item) => ({
            id: item.id,
            title: item.title ?? '',
            visible: item.visible ?? true,
            clientId: item.clientId ?? (!item.id ? nextFilterClientId() : undefined),
        }));

        const isBlank = (item: FilterListItem) => (item.title ?? '').trim() === '';
        const nonBlank = withStableIds.filter((item) => !isBlank(item));
        const blankItem = withStableIds.find(isBlank);

        if (blankItem?.clientId) {
            placeholderClientIdsRef.current[fieldName] = blankItem.clientId;
        }

        const placeholderId = ensurePlaceholderClientId(fieldName, nonBlank);
        const placeholder: FilterListItem = blankItem ?? {
            title: '',
            visible: true,
            clientId: placeholderId,
        };

        if (nonBlank.length === 0) {
            return [placeholder];
        }

        return [...nonBlank, placeholder];
    };

    const gentleSpring = {
        type: 'spring',
        stiffness: 260,
        damping: 26,
        mass: 0.85,
    } as const;
    const listLayoutTransition = {
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1],
    } as const;

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
                                        rows={
                                            f.name === 'description' ? descriptionRows : undefined
                                        }
                                        onChange={(e) => {
                                            if (readOnly) return;
                                            setData(f.name, e.target.value);
                                        }}
                                    />
                                ) : f.type === 'select' ? (
                                    <Select
                                        value={
                                            data[f.name] === undefined || data[f.name] === null
                                                ? undefined
                                                : String(data[f.name])
                                        }
                                        onValueChange={(value) => {
                                            if (readOnly) return;
                                            const nextValue = f.parseAsNumber
                                                ? Number(value)
                                                : value;
                                            setData(f.name, nextValue);
                                        }}
                                        disabled={readOnly}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder={`Select ${f.label}`} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {(f.options ?? []).map((option) => (
                                                <SelectItem
                                                    key={String(option.value)}
                                                    value={String(option.value)}
                                                >
                                                    {option.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                ) : f.type === 'filter-list' ? (
                                    <motion.div
                                        layout
                                        transition={{ layout: listLayoutTransition }}
                                        className="space-y-3 rounded-lg border p-3"
                                    >
                                        {(() => {
                                            const items = normalizeFilterList(data[f.name], f.name);
                                            const updateItems = (nextItems: FilterListItem[]) => {
                                                if (readOnly) return;
                                                setData(
                                                    f.name,
                                                    normalizeFilterList(nextItems, f.name),
                                                );
                                            };

                                            return (
                                                <LayoutGroup>
                                                    <motion.div
                                                        layout
                                                        transition={gentleSpring}
                                                        className="space-y-3"
                                                    >
                                                        <AnimatePresence initial={false}>
                                                            {items.map((item, index) => {
                                                                const isLast =
                                                                    index === items.length - 1;
                                                                const isBlank =
                                                                    (item.title ?? '').trim() ===
                                                                    '';
                                                                const isPlaceholder =
                                                                    isLast && isBlank && !item.id;
                                                                const inputId = `${f.id}-visible-${index}`;
                                                                const rowKey =
                                                                    item.id !== undefined
                                                                        ? `filter-${item.id}`
                                                                        : (item.clientId ??
                                                                          `filter-new-${index}`);

                                                                const handleTitleChange = (
                                                                    value: string,
                                                                ) => {
                                                                    const next = [...items];
                                                                    next[index] = {
                                                                        ...next[index],
                                                                        title: value,
                                                                    };
                                                                    updateItems(next);
                                                                };

                                                                const handleToggleVisible = () => {
                                                                    const next = [...items];
                                                                    const currentVisible =
                                                                        next[index]?.visible ??
                                                                        true;
                                                                    next[index] = {
                                                                        ...next[index],
                                                                        visible: !currentVisible,
                                                                    };
                                                                    updateItems(next);
                                                                };

                                                                const handleRemove = () => {
                                                                    const next = items.filter(
                                                                        (_, i) => i !== index,
                                                                    );
                                                                    updateItems(next);
                                                                };

                                                                const layoutTransition =
                                                                    isPlaceholder
                                                                        ? {
                                                                              ...gentleSpring,
                                                                              stiffness: 120,
                                                                              damping: 32,
                                                                              mass: 1.25,
                                                                          }
                                                                        : gentleSpring;

                                                                const fadeDuration = isPlaceholder
                                                                    ? 0.9
                                                                    : 0.22;
                                                                const fadeDelay = isPlaceholder
                                                                    ? 0.08
                                                                    : 0;

                                                                return (
                                                                    <motion.div
                                                                        key={rowKey}
                                                                        layout="position"
                                                                        layoutId={`filter-row-${rowKey}`}
                                                                        initial={{
                                                                            opacity: 0,
                                                                            height: 0,
                                                                        }}
                                                                        animate={{
                                                                            opacity: 1,
                                                                            height: 'auto',
                                                                        }}
                                                                        exit={{
                                                                            opacity: 0,
                                                                            height: 0,
                                                                        }}
                                                                        transition={{
                                                                            layout: layoutTransition,
                                                                            height: {
                                                                                duration:
                                                                                    isPlaceholder
                                                                                        ? 0.9
                                                                                        : 0.45,
                                                                                ease: [
                                                                                    0.22, 1, 0.36,
                                                                                    1,
                                                                                ],
                                                                                delay: fadeDelay,
                                                                            },
                                                                            opacity: {
                                                                                duration:
                                                                                    fadeDuration,
                                                                                ease: 'easeOut',
                                                                                delay: fadeDelay,
                                                                            },
                                                                        }}
                                                                        className="overflow-hidden"
                                                                    >
                                                                        <div className="rounded-md border p-3">
                                                                            <div className="flex flex-col gap-2">
                                                                                <div className="flex items-center justify-between gap-3">
                                                                                    <div className="filter-checks">
                                                                                        <Input
                                                                                            id={
                                                                                                inputId
                                                                                            }
                                                                                            className="demo1"
                                                                                            type="checkbox"
                                                                                            checked={
                                                                                                item.visible ??
                                                                                                true
                                                                                            }
                                                                                            disabled={
                                                                                                readOnly
                                                                                            }
                                                                                            onChange={
                                                                                                handleToggleVisible
                                                                                            }
                                                                                        />
                                                                                        <Label
                                                                                            htmlFor={
                                                                                                inputId
                                                                                            }
                                                                                            data-on-label="ON"
                                                                                            data-off-label="OFF"
                                                                                        />
                                                                                    </div>
                                                                                    <div className="mr-auto text-muted-foreground/40">
                                                                                        (visibility)
                                                                                    </div>
                                                                                    {!readOnly &&
                                                                                        !(
                                                                                            isLast &&
                                                                                            isBlank
                                                                                        ) && (
                                                                                            <Button
                                                                                                type="button"
                                                                                                variant="outline"
                                                                                                className="h-9 px-3"
                                                                                                onClick={
                                                                                                    handleRemove
                                                                                                }
                                                                                            >
                                                                                                Remove
                                                                                            </Button>
                                                                                        )}
                                                                                </div>
                                                                                <Input
                                                                                    value={
                                                                                        item.title ??
                                                                                        ''
                                                                                    }
                                                                                    placeholder="Filter title"
                                                                                    readOnly={
                                                                                        readOnly
                                                                                    }
                                                                                    onChange={(e) =>
                                                                                        handleTitleChange(
                                                                                            e.target
                                                                                                .value,
                                                                                        )
                                                                                    }
                                                                                />
                                                                            </div>
                                                                        </div>
                                                                    </motion.div>
                                                                );
                                                            })}
                                                        </AnimatePresence>
                                                    </motion.div>
                                                </LayoutGroup>
                                            );
                                        })()}
                                        {!readOnly && (
                                            <p className="text-xs text-muted-foreground">
                                                Fill a row to automatically add the next one.
                                            </p>
                                        )}
                                    </motion.div>
                                ) : f.type === 'file' ? (
                                    <div className="flex flex-col space-y-3">
                                        <Label
                                            htmlFor={f.id}
                                            onDragEnter={readOnly ? undefined : handleDrag}
                                            onDragOver={readOnly ? undefined : handleDrag}
                                            onDragLeave={readOnly ? undefined : handleDrag}
                                            onDrop={
                                                readOnly ? undefined : (e) => handleDrop(e, f.name)
                                            }
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
                                                showPreview
                                                    ? 'max-h-48 opacity-100'
                                                    : 'max-h-0 opacity-0',
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
                                                                const input =
                                                                    document.getElementById(
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
                                ) : f.type === 'filters' ? (
                                    <div>
                                        <AnimeAdminFilters
                                            filters={filters}
                                            value={
                                                Array.isArray(data?.[f.name]) ? data[f.name] : []
                                            }
                                            onChange={(next) => {
                                                if (readOnly) return;
                                                setData(f.name, next);
                                            }}
                                            readOnly={readOnly}
                                        />
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
