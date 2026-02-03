import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { AdminFormField } from '@/types/admin/adminTable';
import { AnimatePresence, LayoutGroup, motion } from 'framer-motion';
import { useRef } from 'react';

type FilterListItem = {
    id?: number;
    title?: string;
    visible?: boolean;
    clientId?: string;
};

type FilterListFieldProps = {
    field: AdminFormField;
    data: Record<string, any>;
    setData: (name: string, value: any) => void;
    readOnly: boolean;
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

export default function FilterListField({ field, data, setData, readOnly }: FilterListFieldProps) {
    const filterClientIdCounterRef = useRef(0);
    const placeholderClientIdsRef = useRef<Record<string, string>>({});

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

    const items = normalizeFilterList(data[field.name], field.name);
    const updateItems = (nextItems: FilterListItem[]) => {
        if (readOnly) return;
        setData(field.name, normalizeFilterList(nextItems, field.name));
    };

    return (
        <motion.div
            layout
            transition={{ layout: listLayoutTransition }}
            className="space-y-3 rounded-lg border p-3"
        >
            <LayoutGroup>
                <motion.div layout transition={gentleSpring} className="space-y-3">
                    <AnimatePresence initial={false}>
                        {items.map((item, index) => {
                            const isLast = index === items.length - 1;
                            const isBlank = (item.title ?? '').trim() === '';
                            const isPlaceholder = isLast && isBlank && !item.id;
                            const inputId = `${field.id}-visible-${index}`;
                            const rowKey =
                                item.id !== undefined
                                    ? `filter-${item.id}`
                                    : item.clientId ?? `filter-new-${index}`;

                            const handleTitleChange = (value: string) => {
                                const next = [...items];
                                next[index] = {
                                    ...next[index],
                                    title: value,
                                };
                                updateItems(next);
                            };

                            const handleToggleVisible = () => {
                                const next = [...items];
                                const currentVisible = next[index]?.visible ?? true;
                                next[index] = {
                                    ...next[index],
                                    visible: !currentVisible,
                                };
                                updateItems(next);
                            };

                            const handleRemove = () => {
                                const next = items.filter((_, i) => i !== index);
                                updateItems(next);
                            };

                            const layoutTransition = isPlaceholder
                                ? {
                                      ...gentleSpring,
                                      stiffness: 120,
                                      damping: 32,
                                      mass: 1.25,
                                  }
                                : gentleSpring;

                            const fadeDuration = isPlaceholder ? 0.9 : 0.22;
                            const fadeDelay = isPlaceholder ? 0.08 : 0;

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
                                            duration: isPlaceholder ? 0.9 : 0.45,
                                            ease: [0.22, 1, 0.36, 1],
                                            delay: fadeDelay,
                                        },
                                        opacity: {
                                            duration: fadeDuration,
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
                                                        id={inputId}
                                                        className="demo1"
                                                        type="checkbox"
                                                        checked={item.visible ?? true}
                                                        disabled={readOnly}
                                                        onChange={handleToggleVisible}
                                                    />
                                                    <Label
                                                        htmlFor={inputId}
                                                        data-on-label="ON"
                                                        data-off-label="OFF"
                                                    />
                                                </div>
                                                <div className="mr-auto text-muted-foreground/40">
                                                    (visibility)
                                                </div>
                                                {!readOnly && !(isLast && isBlank) && (
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        className="h-9 px-3"
                                                        onClick={handleRemove}
                                                    >
                                                        Remove
                                                    </Button>
                                                )}
                                            </div>
                                            <Input
                                                value={item.title ?? ''}
                                                placeholder="Filter title"
                                                readOnly={readOnly}
                                                onChange={(e) =>
                                                    handleTitleChange(e.target.value)
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
        </motion.div>
    );
}
