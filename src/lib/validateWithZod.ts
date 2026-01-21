import { ZodSchema, ZodError } from 'zod';

export type ClientErrors = Record<string, string>;

export function validateWithZod<T extends object>(
    schema: ZodSchema<T>,
    values: T,
): { ok: true } | { ok: false; errors: ClientErrors } {
    const result = schema.safeParse(values);
    if (result.success) return { ok: true };
    const errors: ClientErrors = {};
    (result.error as ZodError).issues.forEach((i) => {
        const field = i.path.join('.');
        if (field && !errors[field]) errors[field] = i.message;
    });
    return { ok: false, errors };
}
