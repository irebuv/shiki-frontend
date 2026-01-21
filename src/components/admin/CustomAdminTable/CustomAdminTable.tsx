import React, { useMemo, useState } from 'react';
import AdminTable from './components/AdminTable';
import type { AdminFormField, CustomAdminTableProps } from '@/types/admin/adminTable';
import CustomModalForm from './components/CustomModalForm';
import { useApiForm } from '@/hooks/useApiForm';
import { validateWithZod, type ClientErrors } from '@/lib/validateWithZod';
import { FormAdminSchema } from '@/validation/formAdmin';
import { Button } from '@/components/ui/button';
import { uploadImage } from '@/api/uploadImage';

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
    const resolveCreatedId = getCreatedId ?? defaultGetCreatedId;

    const initialFormData = useMemo(() => buildInitialFormData(formFields), [formFields]);

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
        setModalOpen(true);
        setIsValid(false);
    };
    const openView = (item: any) => {
        resetForm(buildFormDataFromItem(formFields, item ?? {}));
        setFormErrorsZod({});
        setMode('view');
        setEditingId(item.id);
        setModalOpen(true);
        setIsValid(false);
    };
    const openEdit = (item: any) => {
        const itemValues = buildFormDataFromItem(formFields, item ?? {});
        resetForm(itemValues);
        setFormErrorsZod({});
        setMode('edit');
        setEditingId(item.id);
        setModalOpen(true);
        setTimeout(
            () =>
                setIsValid(FormAdminSchema.safeParse(itemValues).success),
            0,
        );
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const run = async () => {
            if (mode === 'create') {
                const result = validateWithZod(FormAdminSchema, formData);
                if (hasValidationErrors(result)) {
                    setFormErrorsZod(result.errors);
                    return;
                }
                setFormErrorsZod({});

                // Create new copy (JSON, Not form-data)
                const created = await formSubmit(createUrl, 'post', {
                    onSuccess: () => {},
                });
                const createdId = resolveCreatedId(created);

                // Upload media after create
                if (formData.image && createdId && imageUploadUrl) {
                    setUploadingImage(true);
                    try {
                        await uploadImage(imageUploadUrl(createdId), formData.image as File);
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

    const validateField = (schema: any, name: string, value: any) => {
        const shape = schema.shape?.[name];
        if (!shape) return null;
        const result = shape.safeParse(value);
        return result.success ? null : result.error.issues[0].message;
    };

    const setFormFields = (name: string, value: any) => {
        setFormData(name as any, value);
        const err = validateField(FormAdminSchema, name, value);
        setFormErrorsZod((prev) => ({
            ...prev,
            [name]: err ?? '',
        }));
        const allValid = FormAdminSchema.safeParse({
            ...formData,
            [name]: value,
        }).success;
        setIsValid(allValid);
    };
    /* ↑↑↑↑↑↑↑↑↑↑↑↑↑ Clients errors ↑↑↑↑↑↑↑↑↑↑↑↑↑ */
    /* ↑↑↑↑↑↑↑↑↑↑↑↑↑ Clients errors ↑↑↑↑↑↑↑↑↑↑↑↑↑ */

    return (
        <>
            <Button type="button" onClick={openCreate} className="w-fit">
                {createLabel ?? 'Add new'}
            </Button>
            <AdminTable
                actions={actions}
                columns={columns}
                isModal={isModal}
                onView={onView}
                onDelete={onDelete}
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
                onSubmit={handleSubmit}
                submitLabel={mode === 'edit' ? 'Save' : 'Create'}
                isValid={isValid}
            />
        </>
    );
};
