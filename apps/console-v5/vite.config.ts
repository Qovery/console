/// <reference types='vitest' />
import { nxCopyAssetsPlugin } from '@nx/vite/plugins/nx-copy-assets.plugin'
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin'
import react from '@vitejs/plugin-react'
import { join } from 'path'
import { defineConfig } from 'vite'
import { viteStaticCopy } from 'vite-plugin-static-copy'

export default defineConfig(() => ({
  root: __dirname,
  cacheDir: '../../node_modules/.vite/apps/console-v5',
  server: {
    port: 4200,
    host: 'localhost',
    fs: {
      allow: ['../..'],
    },
  },
  preview: {
    port: 4200,
    host: 'localhost',
  },
  plugins: [
    react(),
    nxViteTsPaths(),
    nxCopyAssetsPlugin(['*.md']),
    viteStaticCopy({
      targets: [
        {
          src: '../../node_modules/@awesome.me/kit-c4457d1be4/icons/webfonts/*',
          dest: 'assets/fonts/font-awesome',
        },
        {
          src: '../../libs/shared/ui/src/lib/assets/**/*',
          dest: 'assets',
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
  // Uncomment this if you are using workers.
  // worker: {
  //  plugins: [ nxViteTsPaths() ],
  // },
  build: {
    outDir: '../../dist/apps/console-v5',
    emptyOutDir: true,
    reportCompressedSize: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
}))
