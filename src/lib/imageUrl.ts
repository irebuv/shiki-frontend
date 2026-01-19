export function imageUrl(path?: string){
    if (!path) return "";
    return `${import.meta.env.VITE_ASSET_URL}/storage/${path}`;
}