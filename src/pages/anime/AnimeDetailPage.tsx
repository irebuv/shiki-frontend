import api from "@/api/axios";
import { QueryState } from "@/components/custom/QueryState";
import { LoadingOverlay } from "@/components/shared/LoadingOverlay";
import type { Anime } from "@/types/anime";
import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom"

export default function AnimeDetailPage() {
    const {slug} = useParams<{slug: string}>();
    const [anime, setAnime] = useState<Anime | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<any>(null);

    const load = useCallback(async () => {
        if (!slug) return;
        setLoading(true);
        setError(null);
        try {
            const res = await api.get(`/anime/${slug}`);
            setAnime(res.data.anime);
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    }, [slug])

    useEffect(() => {load();}, [load]);

    return (
        <QueryState
            loading={loading}
            error={error}
            onRetry={load}
            overlay={<LoadingOverlay />}
            className="container mx-auto p-4"
        >
            <div className="grid grid-cols-7 gap-10 text-black">
                <div className="col-span-5 bg-background-light/50 rounded p-4">{anime?.name}</div>
                <div className="col-span-2 bg-background-light/50 rounded p-4">fff</div>
            </div>
        </QueryState>
    )
}
