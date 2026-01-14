import { ReactNode } from "react"
import Header from "../shared/Header/Header";

type AppLayoutProps = {
    children: ReactNode;
    className?: string;
}

export default function MainLayout({children, className}: AppLayoutProps) {
    return(
        <div className="flex min-h-screen flex-col">
            <Header/>
            <div className={`flex flex-1 min-h-full ${className}`}>
                {children}
            </div>
            <footer className="mt-auto text-center p-2">
                2025
            </footer>
        </div>
    )
}