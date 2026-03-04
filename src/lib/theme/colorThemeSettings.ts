export type ColorThemeMode = 'default' | 'dynamic' | 'manual';

export type ColorThemeSettings = {
   mode: ColorThemeMode;
   manualHue: number;
   dynamicDurationSec: number;
};

export const COLOR_THEME_STORAGE_KEY = 'color-theme-settings';
export const COLOR_THEME_DEFAULT_HUE = 237.33;
export const COLOR_THEME_DYNAMIC_ANIMATION = 'theme-rainbow 12s linear infinite';

export const MIN_DYNAMIC_DURATION_SEC = 1;
export const MAX_DYNAMIC_DURATION_SEC = 1200;

export const DEFAULT_COLOR_THEME_SETTINGS: ColorThemeSettings = {
   mode: 'default',
   manualHue: 237.33,
   dynamicDurationSec: 12,
};

function isMode(value: unknown): value is ColorThemeMode {
   return value === 'default' || value === 'dynamic' || value === 'manual';
}

export function clampHue(value: number): number {
   if (!Number.isFinite(value)) return COLOR_THEME_DEFAULT_HUE;
   return Math.min(360, Math.max(0, Number(value)));
}

export function clampDynamicDuration(value: number): number {
   if (!Number.isFinite(value)) return 12;
   return Math.min(MAX_DYNAMIC_DURATION_SEC, Math.max(MIN_DYNAMIC_DURATION_SEC, Number(value)));
}

export function sanitizeColorThemeSettings(value: unknown): ColorThemeSettings {
   if (!value || typeof value !== 'object'){
      return DEFAULT_COLOR_THEME_SETTINGS;
   }

   const candidate = value as Partial<ColorThemeSettings>;

   return {
      mode: isMode(candidate.mode) ? candidate.mode : DEFAULT_COLOR_THEME_SETTINGS.mode,
      manualHue: clampHue(Number(candidate.manualHue)),
      dynamicDurationSec: clampDynamicDuration(Number(candidate.dynamicDurationSec)),
   };
}

function readStoredSettings(): ColorThemeSettings {
   if (typeof window === 'undefined') return DEFAULT_COLOR_THEME_SETTINGS;

   try {
      const raw = localStorage.getItem(COLOR_THEME_STORAGE_KEY);
      if (!raw) return DEFAULT_COLOR_THEME_SETTINGS;
      return sanitizeColorThemeSettings(JSON.parse(raw));
   } catch {
      return DEFAULT_COLOR_THEME_SETTINGS;
   }
}

export function applyColorThemeSettings(settings: ColorThemeSettings): void {
   if (typeof document === 'undefined') return;

   const root = document.documentElement;
   const safe = sanitizeColorThemeSettings(settings);

   // default: static design hue
   if (safe.mode === 'default'){
      root.style.setProperty('--color-theme-h', String(COLOR_THEME_DEFAULT_HUE));
      root.style.setProperty('--color-theme-animation', 'none');
      return;
   }

   //dynamic: changing animation in rainbow way
   if (safe.mode === 'dynamic') {
  root.style.setProperty('--color-theme-h', String(COLOR_THEME_DEFAULT_HUE));
  root.style.setProperty('--color-theme-duration', `${safe.dynamicDurationSec}s`);
  root.style.setProperty(
    '--color-theme-animation',
    'theme-rainbow var(--color-theme-duration) linear infinite'
  );
      return;
   }

   // manual: user hue from slider, no animation
   root.style.setProperty('--color-theme-h', String(safe.manualHue));
   root.style.setProperty('--color-theme-animation', 'none');
}

export function initColorThemeSettings(): void {
   const stored = readStoredSettings();
   applyColorThemeSettings(stored);
}
