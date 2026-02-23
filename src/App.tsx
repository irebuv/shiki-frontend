import { useLocation, useNavigate, useRoutes } from 'react-router-dom';
import { toast, Toaster } from './components/custom/Sonner';
import { useEffect, useRef } from 'react';
import { appRoutes } from './routes/AppRoutes';
import { initGa4, trackGa4Page } from './lib/ga4';

function App() {
    const element = useRoutes(appRoutes);
    const location = useLocation();
    const navigate = useNavigate();
    const toastShownRef = useRef(false);
    const trackedPathRef = useRef('');

    useEffect(() => {
      initGa4();
    }, [])

    useEffect(() => {
      const path = `${location.pathname}${location.search}${location.hash}`;
      if (trackedPathRef.current === path) return;
      trackedPathRef.current = path;
      trackGa4Page(path);
    }, [location.pathname, location.search, location.hash]);

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
