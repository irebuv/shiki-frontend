/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_JWT_STORAGE_KEY: string;
    readonly VITE_GA4_MEASUREMENT_ID?: string;
  // add any other VITE_* vars here
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
