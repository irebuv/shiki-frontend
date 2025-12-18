import api from '@/api/axios';
import { useCallback, useEffect, useState } from 'react';

type UseQueryDataParams<TFilters> = {
    url: string;
    initial: TFilters;
};

export function useQueryData<TData, TFilters extends Record<string, any>>({
    url,
    initial,
}: UseQueryDataParams<TFilters>) {
    const [filters, setFiltersState] = useState<TFilters>(() => {
        const params = new URLSearchParams(window.location.search);
        const obj = { ...initial };
        Object.keys(initial).forEach((key) => {
            const value = params.get(key);
            if (value !== null) obj[key as keyof TFilters] = value as any;
        });
        return obj;
    });

    const [data, setData] = useState<TData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<any>(null);

    const fetchData = useCallback(
        async (paramsObj: TFilters) => {
            setLoading(true);
            try {
                const response = await api.get<TData>(url, {
                    params: paramsObj,
                });
                setData(response.data);
                setError(null);
            } catch (err) {
                setError(err);
            } finally {
                setLoading(false);
            }
        },
        [url]
    );

    const refetch = useCallback(() => {
        fetchData(filters);
    }, [filters, fetchData]);

    const setFilters = (newValues: Partial<TFilters>) => {
        const updated = {...filters, ...newValues};
        if(!("page" in newValues)){
            (updated as any).page = 1;
        }
        setFiltersState(updated);
        const params = new URLSearchParams(updated as Record<string, string>);
        window.history.pushState({}, "", `?${params.toString()}`);
        fetchData(updated);
    };

    useEffect(() => {
        fetchData(filters);

        const onPopState = () => {
            const params = new URLSearchParams(window.location.search);
            const restoredFilters = {...initial};
            Object.keys(initial).forEach((key) => {
                const value = params.get(key);
                if (value !== null){
                    restoredFilters[key as keyof TFilters] =value as any;
                }
            });
            setFiltersState(restoredFilters);
            fetchData(restoredFilters);
        }

        window.addEventListener("popstate", onPopState);
        return () => window.removeEventListener("popstate", onPopState);
    }, []);

    return {data, filters, setFilters, loading, error, refetch}
}
