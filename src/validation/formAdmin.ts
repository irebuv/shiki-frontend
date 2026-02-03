import { z, type ZodTypeAny } from 'zod';
import type { AdminFormField } from '@/types/admin/adminTable';

const defaultFileSchema = z
    .instanceof(File)
    .optional()
    .or(z.null())
    .refine((f) => !f || f.size <= 8_000_000, 'Image must be <= 8MB')
    .refine((f) => !f || /^image\//.test(f.type), 'Only images');

const defaultSchemaByType = (field: AdminFormField): ZodTypeAny => {
    switch (field.type) {
        case 'text':
        case 'textarea':
        case 'select':
            return z.string();
        case 'file':
            return defaultFileSchema;
        default:
            return z.any();
    }
};

export const buildAdminSchema = (fields: AdminFormField[]) => {
    const shape: Record<string, ZodTypeAny> = {};
    fields.forEach((field) => {
        if (field.type === 'season' && field.secondaryName) {
            if (field.validation === false) {
                shape[field.name] = z.any();
            } else {
                shape[field.name] = field.validation ?? defaultSchemaByType(field);
            }

            if (field.secondaryValidation === false) {
                shape[field.secondaryName] = z.any();
            } else {
                shape[field.secondaryName] =
                    field.secondaryValidation ?? defaultSchemaByType(field);
            }
            return;
        }

        if (field.validation === false) {
            shape[field.name] = z.any();
            return;
        }
        shape[field.name] = field.validation ?? defaultSchemaByType(field);
    });
    return z.object(shape);
};
