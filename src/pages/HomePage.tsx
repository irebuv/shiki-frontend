import { useState } from 'react';

export default function HomePage() {
    const [count, setCount] = useState(0);

    return (
        <div>
            <h1 className='font-sans'>Vite + React</h1>
            <div className="card">
                <button onClick={() => setCount((count) => count + 1)}>count is {count}</button>
                <p>
                    Edit <code>src/App.jsx</code> and save to test HMR
                </p>
            </div>
            <div className="flex items-center justify-center min-h-screen bg-background text-white">
                <h1 className="text-3xl font-bold">Hello Tailwind v4</h1>
            </div>
            <p className="read-the-docs">Click on the Vite and React logos to learn more</p>
        </div>
    );
}
