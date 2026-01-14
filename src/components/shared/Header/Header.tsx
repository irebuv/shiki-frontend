
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import Logo from './Logo';
import { useAuth } from '@/context/AuthContext';
import { Link } from 'react-router-dom';
import MenuHeader from './MenuHeader';
import { Home, LucideProps } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

type NavLinks = {
    title: string;
    href: string;
    icon?: React.ComponentType<LucideProps>;
};
export default function Header() {
    const { user, loading } = useAuth();
    const [scrolled, setScrolled] = useState(false);
    const linksNav: NavLinks[] = [
        {
            title: 'Home',
            href: '/',
            icon: Home,
        },
        {
            title: 'Anime',
            href: '/anime',
        },
    ];
    const linksProfile: NavLinks[] = [
        {
            title: 'Home',
            href: '/',
        },
        {
            title: 'admin',
            href: '/admin',
        },
    ];
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 0);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <motion.header
            initial={{ boxShadow: '0px 0px 0px rgba(0,0,0)' }}
            transition={{ duration: 0.3 }}
            animate={{
                boxShadow: scrolled
                    ? '0px 4px 6px rgba(122,122,122,0.3)'
                    : '0px 0px 0px rgba(0,0,0,0)',
            }}
            className="sticky top-0 left-0 z-40 w-full bg-secondary p-2"
        >
            <div className="flex justify-between items-center">
                <Link to="/">
                    <Logo />
                </Link>
                <MenuHeader links={linksNav} />
               <ThemeToggle />
                {user ? (
                    <MenuHeader links={linksProfile} title={user.name} hasLogout={true} />
                ) : (
                    <Link to="/login">Login</Link>
                )}
            </div>
        </motion.header>
    );
}
