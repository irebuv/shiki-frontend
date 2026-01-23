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
        return acc;
    }, {});
};

const buildFormDataFromItem = (fields: AdminFormField[], item: Record<string, any>) => {
    return fields.reduce<Record<string, any>>((acc, field) => {
        if (field.type === 'file') {
            acc[field.name] = null;
            return acc;
        }
        const value = field.getValue ? field.getValue(item) : item?.[field.name];
        acc[field.name] = value ?? getDefaultFieldValue(field);
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

const defaultGetCreatedId = (created: any) => created?.data?.id ?? created?.id;
const hasValidationErrors = (
    result: { ok: true } | { ok: false; errors: ClientErrors },
): result is { ok: false; errors: ClientErrors } => result.ok === false;

export const CustomAdminTable = ({
    columns,
    actions,
    data,
    from,
    onDelete,
    onView,
    onEdit,
    isModal,
    deleteUrl,
    modalTitle,
    modalDescription,
    formFields,
    refetch,
    createUrl,
    updateUrl,
    updateMethod,
    imageUploadUrl,
    createLabel,
    getCreatedId,
}: CustomAdminTableProps) => {
    /* ↓↓↓↓↓↓↓↓↓↓↓↓↓ Form block ↓↓↓↓↓↓↓↓↓↓↓↓↓ */
    /* ↓↓↓↓↓↓↓↓↓↓↓↓↓ Form block ↓↓↓↓↓↓↓↓↓↓↓↓↓ */
    const [modalOpen, setModalOpen] = useState(false);
    const [mode, setMode] = useState<'create' | 'view' | 'edit'>('create');
    const [editingId, setEditingId] = useState<number | null>(null);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [filePreviewUrls, setFilePreviewUrls] = useState<Record<string, string | null>>({});
    const resolveCreatedId = getCreatedId ?? defaultGetCreatedId;
    const resolveUpdateUrl = updateUrl ?? ((id: number) => `${createUrl}/${id}`);

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
    console.log('form', formData);

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
        setTimeout(
            () =>
                setIsValid(formSchema.safeParse(itemValues).success),
            0,
        );
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const run = async () => {
            if (mode === 'create') {
                const result = validateWithZod(formSchema, formData);
                if (hasValidationErrors(result)) {
                    setFormErrorsZod(result.errors);
                    return;
                }
                setFormErrorsZod({});

                // Create new copy (JSON, Not form-data)
                const created = await formSubmit(createUrl, 'post', {
                    onSuccess: () => {},
                });
                if (created?.message) toast.success(created.message);
                const createdId = resolveCreatedId(created);

                // Upload media after create
                if (formData.image && createdId && imageUploadUrl) {
                    setUploadingImage(true);
                    try {
                        const imageRes = await uploadImage(
                            imageUploadUrl(createdId),
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

                const result = validateWithZod(formSchema, formData);
                if (hasValidationErrors(result)) {
                    setFormErrorsZod(result.errors);
                    return;
                }
                setFormErrorsZod({});

                const updated = await formSubmit(resolveUpdateUrl(editingId), updateMethod ?? 'put', {
                    onSuccess: () => {},
                });
                if (updated?.message) toast.success(updated.message);

                const updatedId = resolveCreatedId(updated) ?? editingId;

                if (formData.image && updatedId && imageUploadUrl) {
                    setUploadingImage(true);
                    try {
                        const imageRes = await uploadImage(
                            imageUploadUrl(updatedId),
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
        const result = shape.safeParse(value);
        return result.success ? null : result.error.issues[0].message;
    };

    const setFormFields = (name: string, value: any) => {
        setFormData(name as any, value);
        const err = validateField(formSchema, name, value);
        setFormErrorsZod((prev) => ({
            ...prev,
            [name]: err ?? '',
        }));
        const allValid = formSchema.safeParse({
            ...formData,
            [name]: value,
        }).success;
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
            <Button type="button" onClick={openCreate} className="w-fit">
                {createLabel ?? 'Add new'}
            </Button>
            <AdminTable
                actions={actions}
                columns={columns}
                isModal={isModal}
                onView={onView ?? ((el) => openView(el))}
                onDelete={onDelete ?? handleDelete}
                onEdit={(el) => openEdit(el)}
                data={data}
                from={from}
                deleteUrl={deleteUrl}
            />
            <CustomModalForm
                open={modalOpen}
                onOpenChange={setModalOpen}
                title={modalTitle}
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
            />
        </>
    );
};
