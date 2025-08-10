import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
// https://vite.dev/config/
export default defineConfig({
  plugins: [ tailwindcss(),react()],
  base: '/', // Para deployment en raíz
  build: {
    outDir: 'dist',
    assetsDir: 'assets', // Directorio para assets
    emptyOutDir: true,
  }
})
