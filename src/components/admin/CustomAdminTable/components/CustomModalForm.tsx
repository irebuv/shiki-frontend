import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function CustomModalForm({
    open,
    onOpenChange,
    title,
    description,
    fields,
    data,
    setData,
    processing,
    uploadingImage,
    errors,
    onSubmit,
    submitLabel = "Submit",
    isValid,
}) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange} modal>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    {description && (
                        <DialogDescription>{description}</DialogDescription>
                    )}
                </DialogHeader>

                <form onSubmit={onSubmit} className="space-y-4">
                    {fields.map((f) => (
                        <div>{f}</div>
                    ))}
                </form>
            </DialogContent>
        </Dialog>
    );
}
