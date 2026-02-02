import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import type { AnimeFilterPreset } from '@/types/anime';
import { useMemo, useState } from 'react';

type Props = {
    presets: AnimeFilterPreset[];
    loading?: boolean;
    canSave: boolean;
    isAuthenticated: boolean;
    onApply: (preset: AnimeFilterPreset) => void;
    onCreate: (name: string) => void;
    onDelete: (preset: AnimeFilterPreset) => void;
};

export default function FilterPresets({
    presets,
    loading = false,
    canSave,
    isAuthenticated,
    onApply,
    onCreate,
    onDelete,
}: Props) {
    const [createOpen, setCreateOpen] = useState(false);
    const [presetName, setPresetName] = useState('');
    const [nameError, setNameError] = useState<string | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<AnimeFilterPreset | null>(null);

    const trimmedName = useMemo(() => presetName.trim(), [presetName]);
    const isNameValid = trimmedName.length >= 2 && trimmedName.length <= 50;

    const closeCreateDialog = () => {
        setCreateOpen(false);
        setPresetName('');
        setNameError(null);
    };

    const handleSave = () => {
        if (!isNameValid) {
            setNameError('Name must be 2-50 characters.');
            return;
        }
        onCreate(trimmedName);
        closeCreateDialog();
    };

    const handleDeleteConfirm = () => {
        if (!deleteTarget) return;
        onDelete(deleteTarget);
        setDeleteTarget(null);
    };

    if (!isAuthenticated) {
        return (
            <div className="rounded-lg border border-dashed bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
                Sign in to save filter presets.
            </div>
        );
    }

    if (loading) {
        return (
            <div className="rounded-lg border border-dashed bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
                Loading presets...
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-3">
            {presets.length === 0 && (
                <div className="rounded-lg border border-dashed bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
                    No presets yet.
                </div>
            )}
            {presets.map((preset) => (
                <div
                    key={preset.id}
                    className="flex items-center gap-2 rounded-lg border bg-background px-2 py-1.5"
                >
                    <Button
                        variant="ghost"
                        size="sm"
                        className="flex-1 justify-start truncate"
                        onClick={() => onApply(preset)}
                    >
                        {preset.name}
                    </Button>
                    <button
                        type="button"
                        className="cursor-pointer size-10 ml-auto inline-flex shrink-0 items-center justify-center rounded-full border border-transparent px-2 py-1 text-destructive hover:border-destructive/30 hover:bg-destructive/10"
                        onClick={() => setDeleteTarget(preset)}
                        aria-label={`Delete preset ${preset.name}`}
                    >
                        <span className="text-2xl leading-none">x</span>
                    </button>
                </div>
            ))}
            <div className="flex flex-col gap-1">
                <Button
                    variant="filter"
                    size="sm"
                    onClick={() => setCreateOpen(true)}
                    disabled={!canSave}
                >
                    {canSave ? 'Save current preset' : 'Preset limit reached'}
                </Button>
                {!canSave && (
                    <span className="text-xs text-muted-foreground">
                        Delete a preset to save a new one.
                    </span>
                )}
            </div>

            <Dialog
                open={createOpen}
                onOpenChange={(open) => (open ? setCreateOpen(true) : closeCreateDialog())}
            >
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Save preset</DialogTitle>
                        <DialogDescription>
                            Save the current filters as a preset (2-50 characters).
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-2">
                        <Input
                            autoFocus
                            placeholder="Preset name"
                            value={presetName}
                            onChange={(e) => {
                                setPresetName(e.target.value);
                                if (nameError) setNameError(null);
                            }}
                            error={Boolean(nameError)}
                            maxLength={50}
                        />
                        {nameError && <div className="text-xs text-destructive">{nameError}</div>}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" type="button" onClick={closeCreateDialog}>
                            Cancel
                        </Button>
                        <Button type="button" onClick={handleSave} disabled={!isNameValid}>
                            Save
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={Boolean(deleteTarget)} onOpenChange={(open) => (!open ? setDeleteTarget(null) : null)}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Delete preset</DialogTitle>
                        <DialogDescription>
                            {deleteTarget
                                ? `Delete preset "${deleteTarget.name}"? This action cannot be undone.`
                                : 'Delete preset?'}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" type="button" onClick={() => setDeleteTarget(null)}>
                            Cancel
                        </Button>
                        <Button type="button" variant="solid" onClick={handleDeleteConfirm}>
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
