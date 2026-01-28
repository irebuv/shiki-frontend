import { useLocalStorage } from '@/hooks/useLocalStorage';
import { AnimatePresence, motion } from 'framer-motion';
import type { ReactNode } from 'react';

type FilterProps = {
    title: string;
    children: ReactNode;
    defaultOpen?: boolean;
    storageKey: string;
};

export default function Filter({ title, children, storageKey, defaultOpen = true }: FilterProps) {
    const [open, setOpen] = useLocalStorage<boolean>(`filters:open:${storageKey}`, defaultOpen);

    return (
        <div className="p-3">
            <button
                className="border-r-8 border-sidebar-ring bg-input px-4 py-2 text-xl cursor-pointer w-full"
                onClick={() => setOpen((v) => !v)}
            >
                <div className="flex justify-between items-center">
                    <span>{title}</span>
                    {open ? (
                        <span className="text-red-800 text-3xl">−</span>
                    ) : (
                        <span className="text-green-700 text-3xl">+</span>
                    )}
                </div>
            </button>
            <AnimatePresence initial={false}>
                {open && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 1 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden pt-3"
                    >
                        {children}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
