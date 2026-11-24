/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_PETSTORE_API_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
