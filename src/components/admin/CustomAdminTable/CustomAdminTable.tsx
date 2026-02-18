import React, { useMemo, useState } from 'react';
import AdminTable from './components/AdminTable';
import type { AdminFormField, CustomAdminTableProps } from '@/types/admin/adminTable';
import CustomModalForm from './components/CustomModalForm';
import { useApiForm } from '@/hooks/useApiForm';
import { validateWithZod, type ClientErrors } from '@/lib/validateWithZod';
import { buildAdminSchema } from '@/validation/formAdmin';
import { Button } from '@/components/ui/button';
import { uploadImage } from '@/api/uploadImage';
import type { ZodObject, ZodTypeAny } from 'zod';
import api from '@/api/axios';
import { toast } from '@/components/custom/Sonner';

const getDefaultFieldValue = (field: AdminFormField) => {
    if (field.type === 'file') return null;
    if (field.defaultValue !== undefined) return field.defaultValue;
    return '';
};

const buildInitialFormData = (fields: AdminFormField[]) => {
    return fields.reduce<Record<string, any>>((acc, field) => {
        acc[field.name] = getDefaultFieldValue(field);
        if (field.type === 'season' && field.secondaryName) {
            acc[field.secondaryName] =
                field.secondaryEmptyValue !== undefined ? field.secondaryEmptyValue : '';
        }
        return acc;
    }, {});
};

const sanitizeFormData = (fields: AdminFormField[], data: Record<string, any>) => {
    const next = { ...data };
    fields.forEach((field) => {
        if (!field.sanitize) return;
        next[field.name] = field.sanitize(next[field.name]);
        if (field.type === 'season' && field.secondaryName && field.secondarySanitize) {
            next[field.secondaryName] = field.secondarySanitize(next[field.secondaryName]);
        }
    });
    return next;
};

const buildFormDataFromItem = (fields: AdminFormField[], item: Record<string, any>) => {
    return fields.reduce<Record<string, any>>((acc, field) => {
        if (field.type === 'file') {
            acc[field.name] = null;
            return acc;
        }
        const value = field.getValue ? field.getValue(item) : item?.[field.name];
        acc[field.name] = value ?? getDefaultFieldValue(field);
        if (field.type === 'season' && field.secondaryName) {
            const secondaryValue = item?.[field.secondaryName];
            acc[field.secondaryName] =
                secondaryValue ??
                (field.secondaryEmptyValue !== undefined ? field.secondaryEmptyValue : '');
        }
        return acc;
    }, {});
};

const buildPreviewUrlsFromItem = (fields: AdminFormField[], item: Record<string, any>) => {
    return fields.reduce<Record<string, string | null>>((acc, field) => {
        if (field.type !== 'file') return acc;
        const url = field.previewUrl ? field.previewUrl(item) : null;
        acc[field.name] = url ?? null;
        return acc;
    }, {});
};

const inferResourceKey = (url: string) => {
    const clean = url.split('?')[0].replace(/\/+$/, '');
    const last = clean.split('/').filter(Boolean).pop() ?? '';
    if (!last) return '';
    if (last.endsWith('ies')) {
        return last.slice(0, -3) + 'y';
    }
    if (last.endsWith('s') && !last.endsWith('ss')) {
        return last.slice(0, -1);
    }
    return last;
};

const defaultGetCreatedId = (created: any, createUrl: string) => {
    const key = inferResourceKey(createUrl);
    return (
        (key ? created?.[key]?.id : undefined) ??
        (key ? created?.data?.[key]?.id : undefined) ??
        created?.data?.id ??
        created?.id
    );
};
const hasValidationErrors = (
    result: { ok: true } | { ok: false; errors: ClientErrors },
): result is { ok: false; errors: ClientErrors } => result.ok === false;

export const CustomAdminTable = ({
    columns,
    actions,
    data,
    from,
    isModal,
    deleteUrl,
    modalTitle,
    modalDescription = " ",
    formFields,
    refetch,
    createUrl,
    updateUrl,
    updateMethod,
    imageUploadUrl,
    createLabel,
    getCreatedId,
    toolbar,
    filters,
}: CustomAdminTableProps) => {
    /* ↓↓↓↓↓↓↓↓↓↓↓↓↓ Form block ↓↓↓↓↓↓↓↓↓↓↓↓↓ */
    /* ↓↓↓↓↓↓↓↓↓↓↓↓↓ Form block ↓↓↓↓↓↓↓↓↓↓↓↓↓ */
    const [modalOpen, setModalOpen] = useState(false);
    const [mode, setMode] = useState<'create' | 'view' | 'edit'>('create');
    const [editingId, setEditingId] = useState<number | null>(null);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [filePreviewUrls, setFilePreviewUrls] = useState<Record<string, string | null>>({});
    const resolveCreatedId = getCreatedId ?? ((created: any) => defaultGetCreatedId(created, createUrl));
    const resolveUpdateUrl = updateUrl ?? ((id: number) => `${createUrl}/${id}`);
    const resolveDeleteUrl = deleteUrl ?? ((id: number) => `${createUrl}/${id}`);
    const resolveImageUploadUrl = imageUploadUrl ?? ((id: number) => `${createUrl}/${id}/image`);

    const initialFormData = useMemo(() => buildInitialFormData(formFields), [formFields]);
    const formSchema = useMemo(() => buildAdminSchema(formFields), [formFields]);

    const {
        data: formData,
        setData: setFormData,
        reset: resetForm,
        errors: formErrors,
        processing: formProcessing,
        withProcessing: withProcessing,
        submit: formSubmit,
    } = useApiForm(initialFormData);

    const openCreate = () => {
        resetForm(initialFormData);
        setFormErrorsZod({});
        setMode('create');
        setEditingId(null);
        setFilePreviewUrls({});
        setModalOpen(true);
        setIsValid(false);
    };
    const openView = (item: any) => {
        resetForm(buildFormDataFromItem(formFields, item ?? {}));
        setFormErrorsZod({});
        setMode('view');
        setEditingId(item.id);
        setFilePreviewUrls(buildPreviewUrlsFromItem(formFields, item ?? {}));
        setModalOpen(true);
        setIsValid(false);
    };
    const openEdit = (item: any) => {
        const itemValues = buildFormDataFromItem(formFields, item ?? {});
        resetForm(itemValues);
        setFormErrorsZod({});
        setMode('edit');
        setEditingId(item.id);
        setFilePreviewUrls(buildPreviewUrlsFromItem(formFields, item ?? {}));
        setModalOpen(true);
        setTimeout(() => {
            const sanitized = sanitizeFormData(formFields, itemValues);
            setIsValid(formSchema.safeParse(sanitized).success);
        }, 0);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const run = async () => {
            const sanitizedFormData = sanitizeFormData(formFields, formData);
            if (mode === 'create') {
                const result = validateWithZod(formSchema, sanitizedFormData);
                if (hasValidationErrors(result)) {
                    setFormErrorsZod(result.errors);
                    return;
                }
                setFormErrorsZod({});

                // Create new copy (JSON, Not form-data)
                const created = await formSubmit(createUrl, 'post', {
                    onSuccess: () => {},
                    dataOverride: sanitizedFormData,
                });
                if (created?.message) toast.success(created.message);
                const createdId = resolveCreatedId(created);

                // Upload media after create
                if (formData.image && createdId && resolveImageUploadUrl) {
                    setUploadingImage(true);
                    try {
                        const imageRes = await uploadImage(
                            resolveImageUploadUrl(createdId),
                            formData.image as File,
                        );
                        if (imageRes?.message) toast.success(imageRes.message);
                    } finally {
                        setUploadingImage(false);
                    }
                }

                resetForm();
                setModalOpen(false);
                refetch?.();
            }

            if (mode === 'edit') {
                if (!editingId) return;

                const result = validateWithZod(formSchema, sanitizedFormData);
                if (hasValidationErrors(result)) {
                    setFormErrorsZod(result.errors);
                    return;
                }
                setFormErrorsZod({});

                const updated = await formSubmit(
                    resolveUpdateUrl(editingId),
                    updateMethod ?? 'put',
                    {
                        onSuccess: () => {},
                        dataOverride: sanitizedFormData,
                    },
                );
                if (updated?.message) toast.success(updated.message);

                const updatedId = resolveCreatedId(updated) ?? editingId;

                if (formData.image && updatedId && resolveImageUploadUrl) {
                    setUploadingImage(true);
                    try {
                        const imageRes = await uploadImage(
                            resolveImageUploadUrl(updatedId),
                            formData.image as File,
                        );
                        if (imageRes?.message) toast.success(imageRes.message);
                    } finally {
                        setUploadingImage(false);
                    }
                }

                resetForm();
                setModalOpen(false);
                refetch?.();
            }
        };
        withProcessing(run);
    };

    /* ↑↑↑↑↑↑↑↑↑↑↑↑↑ Form block ↑↑↑↑↑↑↑↑↑↑↑↑↑ */
    /* ↑↑↑↑↑↑↑↑↑↑↑↑↑ Form block ↑↑↑↑↑↑↑↑↑↑↑↑↑ */

    /* ↓↓↓↓↓↓↓↓↓↓↓↓↓ Clients errors ↓↓↓↓↓↓↓↓↓↓↓↓↓ */
    /* ↓↓↓↓↓↓↓↓↓↓↓↓↓ Clients errors ↓↓↓↓↓↓↓↓↓↓↓↓↓ */
    const [formErrorsZod, setFormErrorsZod] = useState<ClientErrors>({});
    const [isValid, setIsValid] = useState(false);

    const mergedFormErrors = { ...formErrors, ...formErrorsZod };

    const validateField = (
        schema: ZodObject<Record<string, ZodTypeAny>>,
        name: string,
        value: any,
    ) => {
        const shape = schema.shape?.[name];
        if (!shape) return null;
        const field = formFields.find((f) => f.name === name);
        const sanitizedValue = field?.sanitize ? field.sanitize(value) : value;
        const result = shape.safeParse(sanitizedValue);
        return result.success ? null : result.error.issues[0].message;
    };

    const setFormFields = (name: string, value: any) => {
        setFormData(name as any, value);
        const err = validateField(formSchema, name, value);
        setFormErrorsZod((prev) => ({
            ...prev,
            [name]: err ?? '',
        }));
        const nextData = {
            ...formData,
            [name]: value,
        };
        const sanitizedNextData = sanitizeFormData(formFields, nextData);
        const allValid = formSchema.safeParse(sanitizedNextData).success;
        setIsValid(allValid);
    };
    /* ↑↑↑↑↑↑↑↑↑↑↑↑↑ Clients errors ↑↑↑↑↑↑↑↑↑↑↑↑↑ */
    /* ↑↑↑↑↑↑↑↑↑↑↑↑↑ Clients errors ↑↑↑↑↑↑↑↑↑↑↑↑↑ */

    const handleDelete = async (id: number, url: string) => {
        if (!url) return;
        const confirmed = window.confirm('Delete this item?');
        if (!confirmed) return;

        await withProcessing(async () => {
            const res = await api.delete(url);
            const msg = res?.data?.message;
            if (msg) toast.success(msg);
            refetch?.();
        });
    };
    return (
        <>
            <div className='flex flex-wrap items-center gap-3 justify-between'>
               {toolbar ? <div className='flex items-center gap-2'>{toolbar}</div> : null}
               <Button type='button' onClick={openCreate} className='w-fit'>
                  {createLabel ?? 'Add new ' + modalTitle}
               </Button>
            </div>
            <AdminTable
                actions={actions}
                columns={columns}
                isModal={isModal}
                onView={(el) => openView(el)}
                onDelete={handleDelete}
                onEdit={(el) => openEdit(el)}
                data={data}
                from={from}
                deleteUrl={resolveDeleteUrl}
            />
            <CustomModalForm
                open={modalOpen}
                onOpenChange={setModalOpen}
                title={
                    mode === 'view'
                        ? 'View ' + modalTitle
                        : mode === 'edit'
                          ? 'Edit ' + modalTitle
                          : 'Create ' + modalTitle
                }
                description={modalDescription}
                fields={formFields}
                data={formData}
                setData={setFormFields}
                errors={mergedFormErrors}
                processing={formProcessing}
                uploadingImage={uploadingImage}
                readOnly={mode === 'view'}
                filePreviewUrls={filePreviewUrls}
                onClearPreview={(fieldName: string) =>
                    setFilePreviewUrls((prev) => ({ ...prev, [fieldName]: null }))
                }
                onSubmit={handleSubmit}
                submitLabel={mode === 'edit' ? 'Save' : 'Create'}
                isValid={isValid}
                filters={filters}
            />
        </>
    );
};
