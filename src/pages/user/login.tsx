import api from '@/api/axios';
import { toast } from '@/components/custom/Sonner';
import { useState } from 'react';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await api.post('/login', { email, password, rememberMe });
            localStorage.setItem('token', res.data.token);
            toast.success('Welcome!');
            window.location.href = '/';
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="flex items-center justify-center h-screen bg-gray-100">
            <form onSubmit={handleLogin} className="bg-white p-8 rounded-2xl shadow-lg w-96">
                <h1 className="text-2xl font-bold mb-6 text-center">Вход</h1>
                <input
                    className="border w-full p-2 mb-3 rounded-md"
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <input
                    className="border w-full p-2 mb-4 rounded-md"
                    type="password"
                    placeholder="Пароль"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <label htmlFor="rememberMe" className="cursor-pointer">
                    <input
                        type="checkbox"
                        id="rememberMe"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                    />{' '}
                    &nbsp; Remember
                </label>
                <button
                    className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
                    type="submit"
                >
                    Войти
                </button>
            </form>
        </div>
    );
};

export default LoginPage;
