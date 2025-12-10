import { useAppTheme } from '@/lib/theme/AppThemeProvider';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import Logo from './Logo';
import { useAuth } from '@/context/AuthContext';
import { div } from 'framer-motion/client';
import { Link } from 'react-router-dom';

type NavLinks = {
    title: string;
    href: string;
};
export default function Header() {
    const { theme, toggleTheme } = useAppTheme();
    const { user, loading } = useAuth();
    const [scrolled, setScrolled] = useState(false);
    const linksNav: NavLinks[] = [
        {
            title: 'Home',
            href: '/',
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
            className="sticky top-0 left-0 z-40 w-full bg-black p-2"
        >
            <div className="flex justify-between items-center">
                <Link to="/">
                    <Logo />
                </Link>
                <div className="test-box">jj</div>
                <div className="bg-white">
                    Header
                    <div className="flex items-center gap-2">
                        <button onClick={toggleTheme} className="cursor-pointer">
                            {theme === 'light' ? '🌞 Light' : '🌙 Dark'}
                        </button>
                    </div>
                </div>
                {user ? <div>profile</div> : <Link to="/login">Login</Link>}
            </div>
        </motion.header>
    );
}
