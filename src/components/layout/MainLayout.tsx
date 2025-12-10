import { ReactNode } from "react"
import Header from "../shared/Header/Header";

type AppLayoutProps = {
    children: ReactNode;
    className?: string;
}

export default function MainLayout({children, className}: AppLayoutProps) {
    return(
        <div>
            <Header/>
            <div className={className}>
                {children}
            </div>
        </div>
    )
}