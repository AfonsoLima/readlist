import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Vite vai gerar a build em "docs/" (combina com o Output Directory do Vercel)
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'docs',
    emptyOutDir: true
  }
})
