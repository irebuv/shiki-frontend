import { useQueryData } from '@/hooks/useQueryData';
import { AnimeResponse, type AnimeFilterPreset } from '@/types/anime';
import api from '@/api/axios';
import { toast } from '@/components/custom/Sonner';
import { useAuth } from '@/context/AuthContext';
import { useCallback, useEffect, useMemo, useState } from 'react';
import AnimeList from './component/AnimeList';
import { Pagination } from '@/components/custom/Pagination';
import AnimeFilters, { ChosenFilters } from './component/AnimeFilters';
import { normalizeList } from '@/lib/filterUtils';
import { AnimeFiltersState } from './types';

export default function AnimePage() {
    const { user } = useAuth();
    const { data, filters, setFilters } = useQueryData<AnimeResponse, AnimeFiltersState>({
        url: '/anime',
        initial: {
            page: 1,
            sort: 'updated_at:desc',
            type: undefined,
            filters: [],
            studios: [],
            age_rating: [],
        },
    });

    const availableFilters = data?.filtersList ?? data?.filters ?? data?.availableFilters;
    const activeFilters = normalizeList(filters?.filters);
    const activeStudios = normalizeList(filters?.studios);
    const activeTypes = normalizeList(filters?.type);
    const activeAgeRate = normalizeList(filters?.age_rating);

    console.log('data-home', data, activeFilters);

    const [presets, setPresets] = useState<AnimeFilterPreset[]>([]);
    const [presetsLoading, setPresetsLoading] = useState(false);

    const canSavePreset = presets.length < 3;

    const fetchPresets = useCallback(async () => {
        if (!user) {
            setPresets([]);
            return;
        }
        setPresetsLoading(true);
        try {
            const res = await api.get<{ presets: AnimeFilterPreset[] }>('/anime-filter-presets');
            setPresets(res.data.presets ?? []);
        } catch (err) {
            setPresets([]);
        } finally {
            setPresetsLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchPresets();
    }, [fetchPresets]);

    const presetPayload = useMemo(
        () => ({
            sort: typeof filters?.sort === 'string' ? filters.sort : 'updated_at:desc',
            type: activeTypes,
            filters: activeFilters,
            studios: activeStudios,
            age_rating: activeAgeRate,
        }),
        [filters?.sort, activeTypes, activeFilters, activeStudios, activeAgeRate],
    );

    const applyPreset = (preset: AnimeFilterPreset) => {
        const p = preset.filters ?? {};
        setFilters({
            sort: p.sort ?? presetPayload.sort,
            type: p.type ?? [],
            filters: p.filters ?? [],
            studios: p.studios ?? [],
            age_rating: p.age_rating ?? [],
        });
    };

    const savePreset = async (name: string) => {
        if (!user) {
            toast.error('Please sign in to save presets.');
            return;
        }
        const trimmed = name.trim();
        if (!trimmed) return;

        try {
            const res = await api.post<{ preset: AnimeFilterPreset }>('/anime-filter-presets', {
                name: trimmed,
                filters: presetPayload,
            });
            setPresets((prev) => [res.data.preset, ...prev].slice(0, 3));
            toast.success('Preset saved.');
        } catch (err) {
            // handled by interceptor
        }
    };

    const deletePreset = async (preset: AnimeFilterPreset) => {
        if (!user) return;
        try {
            await api.delete(`/anime-filter-presets/${preset.id}`);
            setPresets((prev) => prev.filter((p) => p.id !== preset.id));
            toast.success('Preset deleted.');
        } catch (err) {
            // handled by interceptor
        }
    };

    return (
        <div className="w-full mx-auto flex flex-col gap-5 px-7 mt-2">
            <div className={'grid grid-cols-5 gap-3'}>

                <AnimeFilters
                    filters={filters}
                    activeFilters={activeFilters}
                    availableFilters={availableFilters}
                    studios={data?.studios ?? []}
                    activeStudios={activeStudios}
                    activeAgeRating={activeAgeRate}
                    setFilters={setFilters}
                    presets={presets}
                    presetsLoading={presetsLoading}
                    canSavePreset={canSavePreset}
                    isAuthenticated={!!user}
                    onApplyPreset={applyPreset}
                    onCreatePreset={savePreset}
                    onDeletePreset={deletePreset}
                />
                <div className={'col-span-4 mt-3 justify-items-start"'}>
                    <div className={'mb-5 grid grid-cols-3 items-center justify-between'}>
                        <div>Home / Anime</div>
                        <h2 className={'mb-1 text-center text-2xl font-bold'}>Anime</h2>
                        <div className={`justify-self-end`}>
                            <Pagination
                                items={data?.pagination}
                                onPageChange={(page) => setFilters({ page })}
                            />
                        </div>
                    </div>
                    <ChosenFilters
                        availableFilters={availableFilters}
                        studios={data?.studios ?? []}
                        activeTypes={activeTypes}
                        activeStudios={activeStudios}
                        activeFilters={activeFilters}
                        activeAgeRating={activeAgeRate}
                        setFilters={setFilters}
                    />
                    <AnimeList data={data?.anime} />
                </div>
            </div>
        </div>
    );
}
