import type { ReactNode } from 'react';
import { ErrorState } from '@/components/custom/ErrorState';
import { cn } from '@/lib/utils';

type QueryStateProps = {
    error?: any;
    loading?: boolean;
    onRetry?: () => void;
    className?: string;
    overlay?: ReactNode;
    children: ReactNode;
};

export function QueryState({
    error,
    loading = false,
    onRetry,
    className,
    overlay,
    children,
}: QueryStateProps) {
    if (error) {
        const status = error?.response?.status;
        const title = status === 403 ? 'Forbidden' : 'Something went wrong';
        const description = error?.response?.data?.message ?? error?.message;
        return <ErrorState title={title} description={description} onRetry={onRetry} />;
    }

    return (
        <div className={cn('relative', className)}>
            {children}
            {loading && overlay}
        </div>
    );
}

