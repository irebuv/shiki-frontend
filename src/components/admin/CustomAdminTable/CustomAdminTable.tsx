import { useState } from 'react';
import AdminTable from './components/AdminTable';
import type { AdminTableProps } from '@/types/admin/adminTable';
import CustomModalForm from './components/CustomModalForm';
import { useApiForm } from '@/hooks/useApiForm';

export const CustomAdminTable = ({
    columns,
    actions,
    data,
    from,
    onDelete,
    onView,
    onEdit,
    isModal,
    modalTitle,
    modalDescription,
    formFields,
}: AdminTableProps) => {
    const [modalOpen, setModalOpen] = useState(true);

    const {
        data: formData,
        setData: setFormData,
        reset: resetForm,
        errors: formErrors,
        processing: formProcessing,
        withProcessing: withProcessing,
        submit: formSubmit,
    } = useApiForm({
        name: "",
        description: "",
    });
    
    
    /* ↓↓↓↓↓↓↓↓↓↓↓↓↓ Clients errors ↓↓↓↓↓↓↓↓↓↓↓↓↓ */
    const [isValid, setIsValid] = useState(false);

    const validateField = (schema: any, name: string, value: any) => {
        const shape = schema.shape?.[name];
        if (!shape) return null;
        const result = shape.safeParse(value);
        return result.success ? null : result.error.issues[0].message;
    };

    const setFormFields = (name: string, value: any) => {
        setFormData(name as any, value);
        const err = validateField(FormSchema, name, value);
        setFormErrors((prev) => ({
            ...prev,
            [name]: err ?? "",
        }));
        const allValid = FormSchema.safeParse({
            ...formData,
            [name]: value,
        }).success;
        setIsValid(allValid);
    }
    /* ↑↑↑↑↑↑↑↑↑↑↑↑↑ Clients errors ↑↑↑↑↑↑↑↑↑↑↑↑↑ */

    return (
        <>
            <AdminTable
                actions={actions}
                columns={columns}
                isModal={isModal}
                onView={onView}
                onDelete={onDelete}
                onEdit={onEdit}
                data={data}
                from={from}
            />
            <CustomModalForm 
                open={modalOpen}
                onOpenChange={setModalOpen}
                title={modalTitle}
                description={modalDescription}
                fields={formFields}
                data={formData}
                setData={setFormFields}
            />
        </>
    );
};
