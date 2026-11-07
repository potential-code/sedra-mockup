import path from 'node:path'
import { fileURLToPath } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const root = path.dirname(fileURLToPath(import.meta.url))

// Static build for potential-mockups: relative base + hash routing, so the folder works
// under any sub-path (/sedra/learning-platform/ and /_preview/...). No CDN at runtime.
export default defineConfig({
  base: './',
  plugins: [
    tanstackRouter({
      target: 'react',
      autoCodeSplitting: true,
      routesDirectory: path.resolve(root, 'src/routes'),
      generatedRouteTree: path.resolve(root, 'src/routeTree.gen.ts'),
      quoteStyle: 'single',
      semicolons: false,
    }),
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(root, 'src'),
      '@shared': path.resolve(root, 'shared'),
    },
  },
  server: { port: 5180, host: '127.0.0.1' },
  preview: { port: 5181, host: '127.0.0.1' },
  build: {
    outDir: path.resolve(root, 'dist/sedra/learning-platform'),
    emptyOutDir: true,
    assetsInlineLimit: 0,
  },
})
