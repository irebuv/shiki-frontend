import { Link } from "react-router-dom";

type NavLink = {
    title: string;
    href: string;
}

type LinksProps = {
    onClick?: () => void;
    links: NavLink[];
}

export default function NavLinks({onClick, links}: LinksProps){
    return (
        <div className="gap-3">
            {links.map(link => (
                <Link 
                    key={link.title}
                    to={link.href}
                    onClick={onClick}
                    className="block hover:text-chart-1"
                >
                    {link.title}
                </Link>
            ))}
        </div>
    );
}