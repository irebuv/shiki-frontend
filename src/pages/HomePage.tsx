import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function HomePage() {
    const [count, setCount] = useState(0);

    return (
        <div className='flex p-8'>
           <Link to={'anime'} className='text-yellow-800 underline'>anime page Link</Link>
        </div>
    );
}
