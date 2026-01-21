import z from 'zod';

export const FormAdminSchema = z.object({
    name: z.string().trim().min(3, 'Min 3 chars').max(120, 'Max 120 chars'),
    description: z.string().max(500, 'Max 500 chars').optional().or(z.literal('')),
    type: z.string().min(1, 'Please select a type'),
    image: z
        .instanceof(File)
        .optional()
        .or(z.null())
        .refine((f) => !f || f.size <= 8_000_000, 'Image must be ≤ 8MB')
        .refine((f) => !f || /^image\//.test(f.type), 'Only images'),
});
export type FormAdminInput = z.infer<typeof FormAdminSchema>;
