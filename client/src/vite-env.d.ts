/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_URL_BACKEND: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

// Lit Web Components support
declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: Record<string, unknown>
    }
  }
}
