const STORAGE_KEY = 'crack-overlay-start-ms';
const DURATION_SEC = 1200;

export function initCrackOverlayPhase(): void {
    if (typeof window === 'undefined') return;

    const root = document.documentElement;
    const stored = Number(localStorage.getItem(STORAGE_KEY));
    const startMs = Number.isFinite(stored) && stored > 0 ? stored : Date.now();

    if (!Number.isFinite(stored) || stored <= 0) {
        localStorage.setItem(STORAGE_KEY, String(startMs));
    }

    const elapsedSec = (Date.now() - startMs) / 1000;
    const delaySec = -(elapsedSec % DURATION_SEC);

    root.style.setProperty('--crack-overlay-delay', `${delaySec}s`);
}
