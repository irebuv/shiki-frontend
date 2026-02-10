export function videoUrl(path?: string | null): string | undefined {
    const safePath = String(path ?? '').trim();
    if (!safePath) return undefined;

    const base = String(import.meta.env.VITE_ASSET_URL ?? '').trim();
    return base ? `${base}${safePath}` : safePath;
}
