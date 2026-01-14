
import { Outlet, RouteObject } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import AdminLayout from '@/components/layout/AdminLayout';
import AdminPanel from '@/pages/admin/AdminPage';
import AnimeAdminPage from '@/pages/admin/anime/AnimeAdminPage';
import NotFoundPage from '@/pages/NotFoundPage';

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
    children: [
        {
            index: true,
            element: <AdminPanel />,
        },
        {
            path: 'user',
            element: <AdminPanel />,
        },
        {
            path: 'anime',
            element: <AnimeAdminPage />,
        },
        { path: '*', element: <NotFoundPage /> }
        // add more admin child routes here; they will be protected automatically
    ],
};
