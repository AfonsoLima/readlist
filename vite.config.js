import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// use exatamente o nome do repositório aqui
export default defineConfig({
  plugins: [react()],
  base: '/readlist/',
  build: { outDir: 'docs' }
})
