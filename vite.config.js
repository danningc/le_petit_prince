import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
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
    server: {
      proxy: {
        '/api/translate': {
          target: 'https://api-free.deepl.com',
          changeOrigin: true,
          rewrite: () => '/v2/translate',
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq) => {
              proxyReq.setHeader('Authorization', `DeepL-Auth-Key ${env.VITE_DEEPL_API_KEY}`)
            })
          },
        },
      },
    },
  }
})
