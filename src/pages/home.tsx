import { useEffect, useState } from 'react';
import { toast } from '@/components/custom/sonner';
import MainLayout from '@/components/layout/MainLayout';
import api from '@/api/axios';

export default function Home() {
    const [count, setCount] = useState(0);
    const [message, setMessage] = useState('loading...');
    const [error, setError] = useState(null);
    const [apiUrl] = useState(import.meta.env.VITE_API_URL);

    useEffect(() => {
        console.log('API URL:', apiUrl);

        api.get('/ping')
            .then((res) => {
                console.log('API response:', res);
                setMessage(res.data.message || JSON.stringify(res.data));
                toast.warning("Your session has expired. Please sign in again.");
                setError(null);
            })
            .catch((err) => {
                console.error('API error:', err);
                setError(err.message);
                setMessage('error');
            });
    }, [apiUrl]);
    return (
        <MainLayout>
            <h1>Vite + React</h1>
            <div className="flex items-center justify-center bg-slate-900 text-white">
                <div className="space-y-3 text-center">
                    <h1 className="text-3xl font-bold">Frontend ↔ Backend test</h1>

                    <p className="text-xl">
                        <span className="font-semibold">Message:</span> {message}
                    </p>

                    <p className="text-sm opacity-80">
                        <span className="font-semibold">API URL:</span> {apiUrl}
                    </p>

                    {error && (
                        <p className="text-sm text-red-400">
                            <span className="font-semibold">Error:</span> {error}
                        </p>
                    )}
                </div>
            </div>
            <div className="card">
                <button onClick={() => setCount((count) => count + 1)}>count is {count}</button>
                <p>
                    Edit <code>src/App.jsx</code> and save to test HMR
                </p>
            </div>
            <div className="flex items-center justify-center min-h-screen bg-slate-900 text-white">
                <h1 className="text-3xl font-bold">Hello Tailwind v4</h1>
            </div>
            <p className="read-the-docs">Click on the Vite and React logos to learn more</p>
        </MainLayout>
    );
}
