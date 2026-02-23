declare global {
   interface Window {
      dataLayer: unknown[];
      gtag?: (...args: unknown[]) => void;
   }
}

const MEASUREMENT_ID = String(import.meta.env.VITE_GA4_MEASUREMENT_ID ?? '').trim();
let initialized = false;

export function initGa4(): void {
  if (!MEASUREMENT_ID || initialized || typeof window === 'undefined') return;
  initialized = true;

  window.dataLayer = window.dataLayer || [];

  // Keep canonical gtag queue format so gtag.js can flush events correctly.
  window.gtag = function (..._args: unknown[]) {
    window.dataLayer.push(arguments);
  };

  window.gtag('js', new Date());
  window.gtag('config', MEASUREMENT_ID, {
    send_page_view: false,
    debug_mode: import.meta.env.DEV,
  });

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`;
  document.head.appendChild(script);
}
export function trackGa4Page(path: string): void {
   if (!MEASUREMENT_ID || typeof window === 'undefined' || typeof window.gtag !== 'function') return;

   window.gtag('event', 'page_view', {
      page_path: path,
      page_location: `${window.location.origin}${path}`,
      page_title: document.title,
   });
}