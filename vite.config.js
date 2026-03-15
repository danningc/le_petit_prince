import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      // Cache the app shell + the book text file for offline use
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,svg,txt}'],
      },
      manifest: {
        name: 'Le Petit Prince — Flashcards',
        short_name: 'Petit Prince',
        description: 'Read Le Petit Prince and build a French vocabulary list',
        theme_color: '#8b5e3c',
        background_color: '#faf8f4',
        display: 'standalone',
        icons: [
          {
            src: '/favicon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable',
          },
        ],
      },
    }),
  ],
})
