import { useAuth } from "@/context/AuthContext";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import NavLinks from "./NavLinks";

type NavLink = {
    title: string;
    href: string;
}

type MenuHeaderProps = {
    links: NavLink[];
    hasLogout?: boolean;
    title?: string;
}

export default function MenuHeader({links, hasLogout, title} : MenuHeaderProps){
    const {user, logout} = useAuth();
    const [profileOpen, setProfileOpen] = useState(false);

    return (
        <div className="relative"
                onMouseEnter={() => {
                    setProfileOpen(!profileOpen)
                }}
                onMouseLeave={() => {
                    setProfileOpen(false);
                }}>
            <button
                className="cursor-pointer focus:outline-none"
            >
                <div className="flex">{title ? title : "Menu"} {profileOpen ? (
                    <X className="h-7 w-7 text-chart-1"/>
                ):(
                    <Menu className="h-7 w-7 text-chart-1" />
                )}</div>
            </button>
            <div className="absolute left-[-50%] flex space-x-8 font-medium text-chart-1 shadow-md shadow-chart-1">
                <AnimatePresence>
                    {profileOpen && (
                        <motion.nav
                            initial={{opacity: 0, y: -20}}
                            animate={{opacity: 1, y: 0}}
                            exit={{opacity: 0, y: -20}}
                            transition={{duration: 0.3}}
                            className="space-y-4 bg-background px-6 py-4 font-medium text-chart-1"
                        >
                            <NavLinks links={links} />
                            {(user && hasLogout) && (
                                <button
                                    className="cursor-pointer"
                                    onClick={logout}
                                >
                                    Logout
                                </button>
                            )}
                        </motion.nav>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
} 