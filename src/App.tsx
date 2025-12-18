import { useLocation, useNavigate, useRoutes } from 'react-router-dom';
import { appRoutes } from './routes/appRoutes';
import { toast, Toaster } from './components/custom/Sonner';
import { useEffect, useRef } from 'react';
console.log('BUILD FROM:', new Date().toISOString());
function App() {
    const element = useRoutes(appRoutes);
    const location = useLocation();
    const navigate = useNavigate();
    const toastShownRef = useRef(false);

    useEffect(() => {
        if (location.state?.toastMessage && !toastShownRef.current) {
            toastShownRef.current = true;

            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [location, navigate]);

    return (
        <>
            {element}
            <Toaster />
        </>
    );
}

export default App;
