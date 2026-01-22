import {Toaster as SonnerToaster, toast as sonnerToast, ToasterProps} from 'sonner';

export function Toaster(props: ToasterProps) {
    return (
        <SonnerToaster
            position="top-right"
            duration={4000}
            richColors
            closeButton
            expand
            {...props}
        />
    );
}

export const toast = sonnerToast;