/// <reference types='vitest' />
import { execSync } from 'child_process'
import { nxCopyAssetsPlugin } from '@nx/vite/plugins/nx-copy-assets.plugin'
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin'
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import react from '@vitejs/plugin-react'
import { join } from 'path'
import { defineConfig, loadEnv } from 'vite'
import { viteStaticCopy } from 'vite-plugin-static-copy'

const readGitValue = (command: string): string | undefined => {
  try {
    const value = execSync(command, {
      cwd: process.cwd(),
      stdio: ['ignore', 'pipe', 'ignore'],
    })
      .toString()
      .trim()

    return value || undefined
  } catch {
    return undefined
  }
}

export default defineConfig(({ mode }) => {
  const clientEnv = loadEnv(mode, process.cwd(), '')
  const gitBranch =
    clientEnv.NX_PUBLIC_GIT_BRANCH || clientEnv.NX_BRANCH || readGitValue('git rev-parse --abbrev-ref HEAD')
  const gitSha = clientEnv.NX_PUBLIC_GIT_SHA || readGitValue('git rev-parse --short HEAD')

  if (gitBranch) {
    clientEnv.NX_PUBLIC_GIT_BRANCH = gitBranch
  }

  if (gitSha) {
    clientEnv.NX_PUBLIC_GIT_SHA = gitSha
  }

  return {
    root: __dirname,
    cacheDir: '../../node_modules/.vite/apps/console-v5',
    server: {
      port: 4200,
      host: 'localhost',
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
    plugins: [
      tanstackRouter({
        target: 'react',
        autoCodeSplitting: true,
      }),
      react(),
      nxViteTsPaths(),
      nxCopyAssetsPlugin(['*.md']),
      viteStaticCopy({
        targets: [
          {
            src: '../../node_modules/@awesome.me/kit-22f4eef36a/icons/webfonts/*',
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
  }
})
