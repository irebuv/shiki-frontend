import { useLocalStorage } from '@/hooks/useLocalStorage';
import {
    applyColorThemeSettings,
    clampDynamicDuration,
    clampHue,
    COLOR_THEME_STORAGE_KEY,
    ColorThemeMode,
    ColorThemeSettings,
    DEFAULT_COLOR_THEME_SETTINGS,
    MAX_DYNAMIC_DURATION_SEC,
    MIN_DYNAMIC_DURATION_SEC,
    sanitizeColorThemeSettings,
} from './colorThemeSettings';
import { useEffect, useRef, useState } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { cn } from '../utils';
import { useAppTheme } from './AppThemeProvider';

const MODE_OPTIONS: Array<{ value: ColorThemeMode; label: string; description: string }> = [
    { value: 'default', label: 'Standard', description: 'Static default' },
    { value: 'dynamic', label: 'Dynamic (rainbow)', description: 'Rainbow flow behavior' },
    { value: 'manual', label: 'Manual', description: 'Static selected by slider' },
];

export function ColorThemeSettingsModal() {
    const [open, setOpen] = useState(false);
    const panelRef = useRef<HTMLDivElement | null>(null);
    const { resolvedTheme } = useAppTheme();

    const [settings, setSettings] = useLocalStorage<ColorThemeSettings>(
        COLOR_THEME_STORAGE_KEY,
        DEFAULT_COLOR_THEME_SETTINGS,
    );

    const safeSettings = sanitizeColorThemeSettings(settings);

    useEffect(() => {
        applyColorThemeSettings(safeSettings);
    }, [safeSettings.mode, safeSettings.manualHue, safeSettings.dynamicDurationSec, resolvedTheme]);

    useEffect(() => {
        if (!open) return;

        const handleClickOutside = (event: MouseEvent) => {
            if (!panelRef.current) return;
            if (panelRef.current.contains(event.target as Node)) return;
            setOpen(false);
        };

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') setOpen(false);
        };

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleEscape);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscape);
        };
    }, [open]);

    const setMode = (mode: ColorThemeMode) => {
        setSettings((prev) => {
            const safePrev = sanitizeColorThemeSettings(prev);
            return { ...safePrev, mode };
        });
    };

    const setManualHue = (raw: number) => {
        const manualHue = clampHue(raw);

        setSettings((prev) => {
            const safePrev = sanitizeColorThemeSettings(prev);
            return { ...safePrev, mode: 'manual', manualHue };
        });
    };

    const setDynamicSpeed = (raw: number) => {
        const dynamicDurationSec = clampDynamicDuration(raw);
        setSettings((prev) => {
            const safePrev = sanitizeColorThemeSettings(prev);
            return { ...safePrev, mode: 'dynamic', dynamicDurationSec };
        });
    };

    return (
        <div ref={panelRef} className="relative">
            <button
                type="button"
                aria-label="Open settings"
                aria-expanded={open}
                onClick={() => setOpen((prev) => !prev)}
                className={cn(
                    'rounded-md border px-3 py-3 cursor-pointer border-foreground/20 transition-colors',
                    open && 'bg-accent text-accent-foreground',
                )}
            >
                <SlidersHorizontal className="size-4" />
            </button>

            {open && (
                <div className="absolute right-0 top-full z-50 mt-2 w-[360px] max-w-[90vw] rounded-lg border bg-background p-3 shadow-xl">
                    <div className="mb-3">
                        <p className="text-sm font-semibold">Settings</p>
                        <p className="text-xs text-muted-foreground">
                            This panel is prepared for additional settings.
                        </p>
                    </div>

                    {/* First section: overlay color mode */}
                    <section className="space-y-3">
                        {MODE_OPTIONS.map((option) => (
                            <div key={option.value}>
                                <div
                                    className='items-start gap-3 p-1 rounded-md  shadow'
                                >
                                    <label
                                        className={cn(
                                            'cursor-pointer flex items-start gap-3 p-4 rounded-md border bg-chart-2/10',
                                            safeSettings.mode === option.value &&
                                                'border-chart-2 bg-chart-2/40',
                                        )}
                                    >
                                        <input
                                            type="radio"
                                            name="color-theme-mode"
                                            className="sr-only"
                                            checked={safeSettings.mode === option.value}
                                            onChange={() => setMode(option.value)}
                                        />
                                        <div className="flex flex-col w-full">
                                            <span className="text-sm font-medium">
                                                {option.label}
                                            </span>
                                            {option.value === 'dynamic' &&
                                                safeSettings.mode === 'dynamic' && (
                                                    <span className="text-sm text-muted-foreground">
                                                        current speed:{' '}
                                                        {safeSettings.dynamicDurationSec}s
                                                    </span>
                                                )}
                                        </div>
                                    </label>
                                    {safeSettings.mode === 'dynamic' &&
                                        option.value === 'dynamic' && (
                                            <div className="rounded-md  p-3 mt-1">
                                                <input
                                                    type="range"
                                                    min={MIN_DYNAMIC_DURATION_SEC}
                                                    max={MAX_DYNAMIC_DURATION_SEC}
                                                    step={1}
                                                    value={safeSettings.dynamicDurationSec}
                                                    onChange={(e) =>
                                                        setDynamicSpeed(Number(e.target.value))
                                                    }
                                                    className="theme-hue-color-default theme-hue-slider"
                                                />
                                            </div>
                                        )}{' '}
                                    {safeSettings.mode === 'manual' &&
                                        option.value === 'manual' && (
                                            <div className="rounded-md  p-3 mt-1">
                                                <input
                                                    type="range"
                                                    min={0}
                                                    max={360}
                                                    step={1}
                                                    value={safeSettings.manualHue}
                                                    onChange={(e) =>
                                                        setManualHue(Number(e.target.value))
                                                    }
                                                    className="theme-hue-slider"
                                                />

                                                {/* <div
                                            className="mt-3 h-8 rounded-md border"
                                            style={{
                                                backgroundColor: `oklch(var(--crack-overlay-l) var(--crack-overlay-c) ${safeSettings.manualHue})`,
                                            }}
                                        /> */}
                                            </div>
                                        )}
                                </div>
                            </div>
                        ))}
                    </section>
                </div>
            )}
        </div>
    );
}
