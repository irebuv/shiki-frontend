import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import Logo from './Logo';
import { useAuth } from '@/context/AuthContext';
import { Link } from 'react-router-dom';
import MenuHeader from './MenuHeader';
import { ThemeToggle } from './ThemeToggle';
import { linksNavMain, linksNavProfile } from '@/routes/appRoutes.config';
import { Input } from '@/components/ui/input';

export default function Header() {
    const { user, loading } = useAuth();
    const [scrolled, setScrolled] = useState(false);
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
            className="border-b border-chart-3/10 sticky top-0 left-0 z-40 w-full bg-header-bg p-2 text-foreground"
        >
            <div className="grid grid-cols-[auto_auto_1fr_auto_auto] gap-4 items-center">
                <Link to="/">
                    <Logo />
                </Link>
                <MenuHeader links={linksNavMain} />
                <Input variant="header" placeholder="Search anime..." className="h-8" />
                <ThemeToggle />
                {user ? (
                    <MenuHeader links={linksNavProfile} title={user.name} hasLogout={true} />
                ) : (
                    <Link to="/login">Login</Link>
                )}
            </div>
        </motion.header>
    );
}
