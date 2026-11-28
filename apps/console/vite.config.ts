/// <reference types='vitest' />
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import { join, resolve } from 'path'
import { defineConfig, loadEnv } from 'vite'
import { viteStaticCopy } from 'vite-plugin-static-copy'

export default defineConfig(({ mode, command }) => {
  const envDir = resolve(process.env.QOVERY_CONSOLE_ENV_DIR ?? process.cwd())
  const clientEnv = loadEnv(mode, envDir, '')
  delete clientEnv.QOVERY_CONSOLE_ENV_DIR
  const pricingApiTarget = clientEnv.NX_PUBLIC_PRICING_API_URL || 'https://billing-api.qovery.com'
  // The billing API does not allow localhost origins. Keep local browser requests on the dev server.
  if (command === 'serve') clientEnv.NX_PUBLIC_PRICING_API_URL = '/__billing-api'

  return {
    root: __dirname,
    envDir,
    resolve: { tsconfigPaths: true },
    cacheDir: '../../node_modules/.vite/apps/console',
    server: {
      port: 4200,
      host: 'localhost',
      hmr: mode !== 'production',
      proxy: {
        '/__billing-api': {
          target: pricingApiTarget,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/__billing-api/, ''),
        },
      },
      cors: {
        origin: '*',
        methods: ['GET'],
        allowedHeaders: ['Content-Type', 'Authorization'],
      },
      fs: {
        allow: ['../..'],
      },
    },
    preview: {
      port: 4200,
      host: 'localhost',
    },
    define: {
      'process.env': JSON.stringify(clientEnv),
    },
    oxc: {
      jsx: {
        runtime: 'automatic',
        importSource: 'react',
      },
    },
    plugins: [
      tanstackRouter({
        target: 'react',
        autoCodeSplitting: true,
        routeFileIgnorePattern: '\\.(spec|test)\\.tsx?$',
      }),
      viteStaticCopy({
        targets: [
          {
            src: '../../node_modules/@awesome.me/kit-22f4eef36a/icons/webfonts/*',
            dest: 'assets/fonts/font-awesome',
            rename: { stripBase: true },
          },
          {
            src: '../../libs/shared/ui/src/lib/assets/**/*',
            dest: 'assets',
            rename: { stripBase: 6 },
          },
        ],
      }),
    ],
    css: {
      preprocessorOptions: {
        scss: {
          includePaths: [join(__dirname, '../../libs/shared/ui/src/lib/styles')],
          additionalData: '',
        },
      },
    },
    build: {
      outDir: '../../dist/apps/console',
      emptyOutDir: true,
      reportCompressedSize: true,
      commonjsOptions: {
        transformMixedEsModules: true,
      },
    },
  }
})
