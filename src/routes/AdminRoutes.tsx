
import { Outlet, RouteObject } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import AdminLayout from '@/components/layout/AdminLayout';
import { adminRoutes } from './adminRoutes.config';

// Single protected parent; all children under /admin/* inherit the guard
export const AdminRoutes: RouteObject = {
    path: '/admin',
    element: (
        <ProtectedRoute allowedRoles={['admin']}>
            <AdminLayout>
                <Outlet />
            </AdminLayout>
        </ProtectedRoute>
    ),
    children: adminRoutes
        .filter((item) => item.route !== false)
        .map((item) => ({
            index: item.index,
            path: item.index
                ? undefined
                : item.path
                  ? item.path.replace(/^\/admin\/?/, '')
                  : undefined,
            element: item.element,
        })),
};
