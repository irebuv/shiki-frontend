import { AdminRoutes } from './AdminRoutes';
import MainLayout from '@/components/layout/MainLayout';
import { Outlet, RouteObject } from 'react-router-dom';
import { appRoutesConfig } from './appRoutes.config';

export const appRoutes: RouteObject[] = [
    {
        path: '/',
        element: (
            <MainLayout>
                <Outlet />
            </MainLayout>
        ),
        children: appRoutesConfig
            .filter((item) => item.route !== false && item.element)
            .map((item) => ({
                index: item.index,
                path: item.index
                    ? undefined
                    : item.path
                      ? item.path.replace(/^\/+/, '')
                      : undefined,
                element: item.element,
            })),
    },
    AdminRoutes,
];
