/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_JWT_STORAGE_key: string;
  // add any other VITE_* vars here
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
