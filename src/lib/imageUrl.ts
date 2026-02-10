export function imageUrl(path?: string | null): string | undefined {
    const safePath = String(path ?? '').trim();
    if (!safePath) return undefined;

    const base = String(import.meta.env.VITE_ASSET_URL ?? '').trim();
    if (!base) return `/storage/${safePath}`;

    return `${base}/storage/${safePath}`;
}
