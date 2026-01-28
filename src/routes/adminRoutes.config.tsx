import AdminPanel from '@/pages/admin/AdminPage';
import AnimeAdminPage from '@/pages/admin/anime/AnimeAdminPage';
import FilterAdminPage from '@/pages/admin/filter/FilterAdminPage';
import StudioAdminPage from '@/pages/admin/studio/StudioAdminPage';
import NotFoundPage from '@/pages/NotFoundPage';
import type { LucideProps } from 'lucide-react';
import { Building2, Funnel, Home, LayoutGrid, Shell } from 'lucide-react';

export type AdminRouteItem = {
    title?: string;
    path?: string;
    index?: boolean;
    element: React.ReactNode;
    nav?: boolean;
    route?: boolean;
    icon?: React.ComponentType<LucideProps>;
};

export const adminRoutes: AdminRouteItem[] = [
    {
        title: 'Home',
        path: '/',
        element: <AdminPanel />,
        nav: true,
        route: false,
        icon: Home,
    },
    {
        title: 'Admin Panel',
        index: true,
        element: <AdminPanel />,
        nav: true,
        icon: LayoutGrid,
        path: '/admin',
    },
    {
        title: 'Anime',
        path: '/admin/anime',
        element: <AnimeAdminPage />,
        nav: true,
        icon: Shell,
    },
    {
        title: 'Filters',
        path: '/admin/filter',
        element: <FilterAdminPage />,
        nav: true,
        icon: Funnel,
    },
    {
        title: 'Studio',
        path: '/admin/studios',
        element: <StudioAdminPage />,
        nav: true,
        icon: Building2,
    },
    {
        path: '/admin/user',
        element: <AdminPanel />,
    },
    {
        path: '*',
        element: <NotFoundPage />,
    },
];

export const linksNavAdmin = adminRoutes
    .filter((item) => item.nav)
    .map((item) => ({
        title: item.title ?? '',
        href: item.path ?? '',
        icon: item.icon,
    }));
