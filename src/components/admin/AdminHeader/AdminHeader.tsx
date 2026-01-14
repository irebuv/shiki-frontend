import Logo from "@/components/shared/Header/Logo";
import NavLinks from "@/components/shared/Header/NavLinks";
import { ThemeToggle } from "@/components/shared/Header/ThemeToggle";
import { Home, LayoutGrid, LucideProps, Shell } from "lucide-react";
import { Link } from "react-router-dom";

type AdminNavLink = {
    title: string;
    href: string;
    icon?: React.ComponentType<LucideProps>;
};

export default function AdminHeader() {
    const linksNav: AdminNavLink[] = [
        {
            title: 'Home',
            href: '/',
            icon: Home,
        },
        {
            title: 'Admin Panel',
            href: '/admin',
            icon: LayoutGrid,
        },
        {
            title: 'Anime',
            href: '/admin/anime',
            icon: Shell,
        },
    ];

    return (
        <header className="flex flex-col py-4 px-6 text-sidebar-foreground min-w-48">
            <Link to="/">
                <Logo />
            </Link>
            <NavLinks links={linksNav} className="mt-6" />
            <ThemeToggle className="mt-auto self-end" />
        </header>
    )
}
