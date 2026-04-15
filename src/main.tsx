import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@/index.css';
import '@/styles/main.scss';
import { BrowserRouter } from 'react-router-dom';
import { AppThemeProvider } from '@/lib/theme/AppThemeProvider';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { initCrackOverlayPhase } from './lib/theme/crackOverlayPhase';
import { initColorThemeSettings } from './lib/theme/colorThemeSettings';

initCrackOverlayPhase();
initColorThemeSettings();

const container = document.getElementById("root");
if(!container) throw new Error("Root element #root not found");

createRoot(container).render(
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
