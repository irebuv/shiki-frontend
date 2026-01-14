import { useLocation, useNavigate, useRoutes } from 'react-router-dom';
import { toast, Toaster } from './components/custom/Sonner';
import { useEffect, useRef } from 'react';
import { appRoutes } from './routes/AppRoutes';
console.log('BUILD FROM:', new Date().toISOString());
function App() {
    const element = useRoutes(appRoutes);
    const location = useLocation();
    const navigate = useNavigate();
    const toastShownRef = useRef(false);

    useEffect(() => {
        const state = (location.state as Record<string, unknown> | undefined) ?? {};
        const msg = state.toastMessage as string | undefined;
        const { toastMessage, ...restState } = state;

        if (msg && !toastShownRef.current) {
            toastShownRef.current = true;
            toast.error(msg);
            navigate(location.pathname + location.search, {
                replace: true,
                state: Object.keys(restState).length ? restState : undefined,
            });
        }

        if (!msg) {
            toastShownRef.current = false;
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
