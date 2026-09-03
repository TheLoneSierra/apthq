import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const DEFAULT_API_PROXY_TARGET =
  'https://oc5l6dayoesmq6w5gi7nzeefqm0mvfwu.lambda-url.ap-south-1.on.aws'

const DEFAULT_V2_PROXY_TARGET = 'https://api.aptdemo.atoms.trade'

const DEFAULT_HEALTH_V3_PROXY_TARGET = 'https://api.aptdemo.atoms.trade'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiProxyTarget =
    env.VITE_API_PROXY_TARGET?.trim() || DEFAULT_API_PROXY_TARGET
  const v2ProxyTarget =
    env.VITE_V2_PROXY_TARGET?.trim() ||
    env.VITE_MAIN_API_PROXY_TARGET?.trim() ||
    DEFAULT_V2_PROXY_TARGET
  const healthV3ProxyTarget =
    env.VITE_HEALTH_V3_PROXY_TARGET?.trim() || DEFAULT_HEALTH_V3_PROXY_TARGET

  return {
    plugins: [react(), tailwindcss()],
    server: {
      proxy: {
        '/api': { target: apiProxyTarget, changeOrigin: true },
        '/health': { target: apiProxyTarget, changeOrigin: true },
        '/v2': { target: v2ProxyTarget, changeOrigin: true },
        '/v3': { target: healthV3ProxyTarget, changeOrigin: true },
      },
    },
    test: {
      globals: true,
      environment: 'node',
      include: ['src/**/*.test.ts'],
    },
  }
})
