import { ReactNode } from 'react';
import Header from '../shared/Header/Header';

type AppLayoutProps = {
    children: ReactNode;
    className?: string;
};

export default function MainLayout({ children, className }: AppLayoutProps) {
    return (
        <div className="relative isolate min-h-screen text-foreground">
            <div className="crack-overlay" aria-hidden="true" />

            <div className="relative z-10 flex min-h-screen flex-col">
                <Header />
                <div className={`flex min-h-full flex-1 ${className}`}>{children}</div>
                <footer className="mt-auto p-2 text-center">2025</footer>
            </div>
        </div>
    );
}
