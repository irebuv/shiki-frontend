import { Lamp } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import AdminHeader from '../admin/AdminHeader/AdminHeader';

export default function AdminLayout({ children }) {
    const [scrolled, setScrolled] = useState(false);
    const contentRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const el = contentRef.current;
        if (!el) return;
        const onScroll = () => setScrolled(el.scrollTop > 0);
        onScroll();
        el.addEventListener('scroll', onScroll);
        return () => el.removeEventListener('scroll', onScroll);
    }, []);

    return (
        <div className="bg-sidebar min-h-screen h-screen w-full box-border flex gap-2 p-2 overflow-hidden">
            <AdminHeader />
            <main className="bg-background relative flex max-w-full flex-1 min-h-0 max-h-full flex-col rounded-2xl shadow-xl overflow-hidden">
                <div
                    className={`sticky top-0 z-10 flex h-16 shrink-0 transition-shadow items-center gap-2 border-b border-sidebar-border/50 px-4 ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:px-4 bg-background ${
                        scrolled ? 'shadow-md' : ''
                    }`}
                >
                    <div className="flex items-center gap-2">
                        <Lamp />
                        <span className="text-foreground font-normal">Dashboard</span>
                    </div>
                </div>
                <div ref={contentRef} className="flex-1 flex min-h-0 p-4 overflow-y-auto">
                     {children}
                </div>
            </main>
        </div>
    );
}
