import { defineConfig } from 'vite'
import dotenv from 'dotenv'
dotenv.config({ path: './client.env' })

export default defineConfig({
  server: {
    port: 3000
  },
  preview: {
    port: 3000
  },
  plugins: [],
  build: {
    target: 'es2020'
  },
  esbuild: {
    target: 'es2020'
  }
})
