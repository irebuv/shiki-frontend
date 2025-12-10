import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@/index.css';
import '@/styles/main.scss';
import { BrowserRouter } from 'react-router-dom';
import { AppThemeProvider } from "@/lib/theme/AppThemeProvider";
import App from './App';

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <BrowserRouter>
            <AppThemeProvider>
                <App />
            </AppThemeProvider>
        </BrowserRouter>
    </StrictMode>
);
