import Logo from "@/components/shared/Header/Logo";
import NavLinks from "@/components/shared/Header/NavLinks";
import { ThemeToggle } from "@/components/shared/Header/ThemeToggle";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { linksNavAdmin } from "@/routes/adminRoutes.config";
import { Link } from "react-router-dom";

export default function AdminHeader() {
    const {logout} = useAuth();
    
    return (
        <header className="flex flex-col py-4 px-6 text-sidebar-foreground min-w-48">
            <Link to="/">
                <Logo />
            </Link>
            <NavLinks links={linksNavAdmin} className="mt-6" />
            <div className="mt-auto justify-between flex gap-2">
                <Button variant="ghost" onClick={logout}>Logout</Button>
                <ThemeToggle />
            </div>
            
        </header>
    )
}
