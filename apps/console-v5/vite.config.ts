/// <reference types='vitest' />
import { nxCopyAssetsPlugin } from '@nx/vite/plugins/nx-copy-assets.plugin'
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin'
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import react from '@vitejs/plugin-react'
import { mkdir, stat, writeFile } from 'fs/promises'
import { join } from 'path'
import { defineConfig, loadEnv } from 'vite'
import { viteStaticCopy } from 'vite-plugin-static-copy'

const COLLECTION_ID_CHANGELOGS = '68d1659afd533e08dfd9e8fa'
const WEBFLOW_CHANGELOGS_DIRECTORY = join(__dirname, 'public', 'webflow')
const WEBFLOW_CHANGELOGS_FILE = join(WEBFLOW_CHANGELOGS_DIRECTORY, 'changelog.json')

interface WebflowChangelog {
  name: string
  summary: string
  url: string
  firstPublishedAt: string
}

interface WebflowCollectionResponse {
  items?: {
    fieldData?: {
      name?: string
      summary?: string
      slug?: string
      ['first-published-at']?: string
    }
  }[]
}

async function writeWebflowChangelogFile(changelogs: WebflowChangelog[]) {
  await mkdir(WEBFLOW_CHANGELOGS_DIRECTORY, { recursive: true })
  await writeFile(WEBFLOW_CHANGELOGS_FILE, JSON.stringify(changelogs, null, 2) + '\n')
}

async function ensureFallbackWebflowChangelogFile() {
  try {
    await stat(WEBFLOW_CHANGELOGS_FILE)
  } catch {
    await writeWebflowChangelogFile([])
  }
}

async function syncWebflowChangelog(webflowToken?: string) {
  if (!webflowToken) {
    await ensureFallbackWebflowChangelogFile()
    return
  }

  try {
    const response = await fetch(`https://api.webflow.com/v2/collections/${COLLECTION_ID_CHANGELOGS}/items?limit=1`, {
      headers: {
        Authorization: `Bearer ${webflowToken}`,
        Accept: 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Webflow API error: ${response.status} ${response.statusText}`)
    }

    const data = (await response.json()) as WebflowCollectionResponse
    const changelogs = (data.items ?? [])
      .map((item) => {
        const fieldData = item.fieldData ?? {}

        if (!fieldData.name || !fieldData.slug || !fieldData['first-published-at']) {
          return undefined
        }

        return {
          name: fieldData.name,
          summary: fieldData.summary ?? '',
          url: `https://www.qovery.com/changelog/${fieldData.slug}`,
          firstPublishedAt: fieldData['first-published-at'],
        }
      })
      .filter((item): item is WebflowChangelog => item !== undefined)

    await writeWebflowChangelogFile(changelogs)
  } catch (error) {
    console.warn('Unable to refresh Webflow changelog asset.', error)
    await ensureFallbackWebflowChangelogFile()
  }
}

export default defineConfig(async ({ mode }) => {
  const { NX_PUBLIC_WEBFLOW_TOKEN, ...clientEnv } = loadEnv(mode, process.cwd(), '')

  await syncWebflowChangelog(NX_PUBLIC_WEBFLOW_TOKEN)

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
