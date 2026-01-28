import type { LucideProps } from 'lucide-react';
import { Home as HomeIcon } from 'lucide-react';
import Home from '@/pages/HomePage';
import Anime from '@/pages/anime/AnimePage';
import LoginPage from '@/pages/user/LoginPage';
import NotFoundPage from '@/pages/NotFoundPage';

type NavGroup = 'main' | 'profile';

export type AppRouteItem = {
    title?: string;
    path?: string;
    index?: boolean;
    element?: React.ReactNode;
    nav?: boolean;
    navGroup?: NavGroup;
    icon?: React.ComponentType<LucideProps>;
    route?: boolean;
};

export const appRoutesConfig: AppRouteItem[] = [
    {
        title: 'Home',
        path: '/',
        index: true,
        element: <Home />,
        nav: true,
        navGroup: 'main',
        icon: HomeIcon,
    },
    {
        title: 'Anime',
        path: '/anime',
        element: <Anime />,
        nav: true,
        navGroup: 'main',
    },
    {
        title: 'Login',
        path: '/login',
        element: <LoginPage />,
    },
    {
        title: 'Admin',
        path: '/admin',
        nav: true,
        navGroup: 'profile',
        route: false,
    },
    {
        title: 'Home',
        path: '/',
        nav: true,
        navGroup: 'profile',
        route: false,
    },
    {
        path: '*',
        element: <NotFoundPage />,
    },
];

export const linksNavMain = appRoutesConfig
    .filter((item) => item.nav && item.navGroup === 'main')
    .map((item) => ({
        title: item.title ?? '',
        href: item.path ?? '',
        icon: item.icon,
    }));

export const linksNavProfile = appRoutesConfig
    .filter((item) => item.nav && item.navGroup === 'profile')
    .map((item) => ({
        title: item.title ?? '',
        href: item.path ?? '',
        icon: item.icon,
    }));
