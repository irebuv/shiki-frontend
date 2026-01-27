import api from "@/api/axios";
import { useState } from "react";


type Errors = Record<string, string[]>;

export function useApiForm<T extends Record<string, any>>(initial: T) {
    const [data, setData] = useState<T>(initial);
    const [errors, setErrors] = useState<Errors>({});
    const [processing, setProcessing] = useState(false);

    const setField = (name: keyof T | string, value: any) => {
        setData((prev) => ({ ...(prev as any), [name]: value}));
    };

    const reset = (newValues?: T) => {
        setData(newValues ?? initial);
        setErrors({});
        setProcessing(false);
    }

// Helper to run any async flow under a single loading flag
    const withProcessing = async <R,>(fn: () => Promise<R>): Promise<R> => {
        setProcessing(true);
        try {
            return await fn();
        } finally {
            setProcessing(false);
        }
    };

    const submit = async (
        url: string,
        method: "post" | "put" | "patch" | "delete" = "post",
        options?: {
            onSuccess?: (res: any) => void;
            asFormData?: boolean;
            dataOverride?: Record<string, any>;
        }
    ) => {
        setProcessing(true);
        setErrors({});

        try {
            const submitData = (options?.dataOverride ?? data) as Record<string, any>;
            let payload: any = null;
            const headers: Record<string, string> = {};

            if (options?.asFormData) {
                const form = new FormData();

                // append all fields
                Object.entries(submitData).forEach(([k, v]) => {
                    if (v === undefined || v === null) return;
                    if (v instanceof File) {
                        form.append(k, v);
                    } else if (Array.isArray(v)) {
                        v.forEach((item) => form.append(`${k}[]`, item as any));
                    } else if (typeof v === "object") {
                        form.append(k, JSON.stringify(v));
                    } else {
                        form.append(k, String(v));
                    }
                });

                if (method === "put" || method === "patch"){
                    form.append("_method", method.toUpperCase());
                    method = "post";
                }

                payload = form;
            } else {
                payload = submitData;
                headers["Content-Type"] = "application/json";
            }

            const res = await api.request({url, method, data: payload, headers});
            options?.onSuccess?.(res.data);
            return res.data;
        } catch (err: any) {
            const e = err;
            if (e?.response?.status === 422 && e.response.data?.errors) {
                setErrors(e.response.data.errors);
            } else if (e?.response?.data?.message) {
                setErrors({_global: [e.response.data.message]});
            } else {
                setErrors({_global: ["Server error"]});
            }
            throw err;
        } finally {
            setProcessing(false);
        }
    };
    return {
        data,
        setData: setField,
        reset,
        errors,
        processing,
        withProcessing,
        submit,
    };
}
