import Anime from '@/pages/anime/AnimePage';
import Home from '@/pages/HomePage';
import LoginPage from '@/pages/user/LoginPage';
import ProtectedRoute from './ProtectedRoute';
import { AdminRoutes } from './AdminRoutes';
import MainLayout from '@/components/layout/MainLayout';
import { Outlet, RouteObject } from 'react-router-dom';
import NotFoundPage from '@/pages/NotFoundPage';

export const appRoutes: RouteObject[] = [
    {
        path: '/',
        element: (
            <MainLayout>
                <Outlet />
            </MainLayout>
        ),
        children: [
            { index: true, element: <Home /> },
            {
                path: 'anime',
                element: (
                    <ProtectedRoute allowedRoles={['admin', 'user']}>
                        <Anime />
                    </ProtectedRoute>
                ),
            },
            { path: 'login', element: <LoginPage /> },
            {path: '*', element: <NotFoundPage />}, // 404
        ],
    },
    AdminRoutes,
];
