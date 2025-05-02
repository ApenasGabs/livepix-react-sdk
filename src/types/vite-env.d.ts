/// <reference types="vite/client" />

interface ImportMeta {
  readonly env: {
    readonly VITE_LIVEPIX_CLIENT_ID: string;
    readonly VITE_LIVEPIX_CLIENT_SECRET: string;
    readonly [key: string]: string;
  };
}
