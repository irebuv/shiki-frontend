import api from '@/api/axios';
import { createContext, useContext, useEffect, useState } from 'react';

interface User {
    id: number;
    name: string;
    email: string;
    role: 'admin' | 'manager' | 'user';
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    login: async () => {},
    logout: () => {},
});

const TOKEN_KEY = import.meta.env.VITE_JWT_STORAGE_KEY || 'token';

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem(TOKEN_KEY);
        if (!token) {
            setLoading(false);
            return;
        }

        // attach token to axios before checking session
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

        api.get("/me")
            .then(res => setUser(res.data))
            .catch(() => {
                localStorage.removeItem(TOKEN_KEY);
                delete api.defaults.headers.common["Authorization"];
            })
            .finally(() => setLoading(false));
    }, []);

    const login = async (email: string, password: string, rememberMe = false) => {
        const res = await api.post("/login", {email, password, rememberMe});
        const token = res.data.token;
        localStorage.setItem(TOKEN_KEY, token);
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

        const userRes = await api.get("/me");
        setUser(userRes.data);
    }

    const logout = async () => {
        await api.post("/logout");
        localStorage.removeItem(TOKEN_KEY);
        delete api.defaults.headers.common["Authorization"];
        setUser(null);
    }

    return (
        <AuthContext.Provider value={{user, loading, login, logout}}>
            {children}
        </AuthContext.Provider>
    )
};

export const useAuth = () => useContext(AuthContext);
