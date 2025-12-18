import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@/index.css';
import '@/styles/main.scss';
import { BrowserRouter } from 'react-router-dom';
import { AppThemeProvider } from '@/lib/theme/AppThemeProvider';
import App from './App';
import { AuthProvider } from './context/AuthContext';

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <BrowserRouter>
            <AuthProvider>
                <AppThemeProvider>
                    <App />
                </AppThemeProvider>
            </AuthProvider>
        </BrowserRouter>
    </StrictMode>
);
