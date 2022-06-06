/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly COORDINATOR_HOST: string;
  readonly MATCHMAKER_HOST: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
