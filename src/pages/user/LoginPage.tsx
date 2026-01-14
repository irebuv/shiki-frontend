import { toast } from '@/components/custom/Sonner';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState<boolean>(() => {
        const saved = localStorage.getItem('rememberMe');
        return saved === 'true';
    });
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const from = (location.state as { from?: string } | undefined)?.from ?? '/';

    useEffect(() => {
        localStorage.setItem('rememberMe', rememberMe ? 'true' : 'false');
    }, [rememberMe]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await login(email, password, rememberMe);
            toast.success('Welcome!');
            navigate(from, { replace: true });
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="flex flex-1 items-center justify-center w-full">
            <form onSubmit={handleLogin} className="bg-white p-8 rounded-2xl shadow-lg w-96">
                <h1 className="text-2xl font-bold mb-6 text-center">Login in</h1>
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
                    placeholder="Password"
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
                    className="w-full bg-blue-600 text-white py-2 mt-3 rounded-md hover:bg-blue-700"
                    type="submit"
                >
                    Enter
                </button>
            </form>
        </div>
    );
};

export default LoginPage;
