import { LucideProps } from "lucide-react";
import React from "react";
import { Link } from "react-router-dom";

type NavLink = {
    title: string;
    href: string;
    icon?: React.ComponentType<LucideProps>;
}

type LinksProps = {
    onClick?: () => void;
    links: NavLink[];
    className?: string;
}

export default function NavLinks({onClick, links, className}: LinksProps){
    return (
        <div className={`gap-3 ${className}`}>
            {links.map(link => (
                <Link 
                    key={link.title}
                    to={link.href}
                    onClick={onClick}
                    className="block hover:text-chart-1 mt-1"
                >
                    <span className="flex items-center gap-2">
                        {link.icon && <link.icon className="h-4 w-4" />}
                        {link.title}
                    </span>
                </Link>
            ))}
        </div>
    );
}
