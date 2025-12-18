import axios from 'axios';
import { toast } from '../components/custom/Sonner';

const TOKEN_KEY = import.meta.env.VITE_JWT_STORAGE_KEY || 'token';

export const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8082/api',
    withCredentials: true,
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

api.interceptors.response.use(
    (res) => res,
    (err) => {
        // Network/CORS case
        if (!err?.response) {
            toast.error('Network error. Please check your connection.');
            return Promise.reject(err);
        }

        const status = err.response.status;
        const serverMsg =
            err.response?.data?.message || 'Something went wrong while processing your request.';

        // Normalize URL (no type annotation here)
        const reqUrl = String(err.config?.url || '');
        const isLoginRoute = reqUrl.includes('/login') || reqUrl.endsWith('login'); // robust enough for relative urls

        // 429: show server message if present; no logout
        if (status === 429) {
            toast.error(serverMsg);
            return Promise.reject(err);
        }

        // 401 on /login = invalid credentials, not expired session
        if (status === 401 && isLoginRoute) {
            // Do NOT remove token here; the user is trying to obtain it
            toast.error(serverMsg || 'Invalid email or password.');
            return Promise.reject(err);
        }

        // Other 401/419/440 = real auth failure during authenticated flows
        if (status === 401 || status === 419 || status === 440) {
            // Clear token and inform the user
            localStorage.removeItem(TOKEN_KEY);
            toast.error('Your session has expired. Please sign in again.');
            return Promise.reject(err);
        }

        // Other errors (400/403/404/5xx): just show backend message
        toast.error(serverMsg);
        return Promise.reject(err);
    }
);
export default api;
