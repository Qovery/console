/// <reference types='vitest' />
import { nxCopyAssetsPlugin } from '@nx/vite/plugins/nx-copy-assets.plugin'
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin'
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import react from '@vitejs/plugin-react'
import { mkdir, stat, writeFile } from 'fs/promises'
import { join } from 'path'
import { defineConfig, loadEnv } from 'vite'
import { viteStaticCopy } from 'vite-plugin-static-copy'

const CHANGELOG_RSS_FEED_URL = 'https://www.qovery.com/changelog/rss.xml'
const CHANGELOG_ASSET_DIRECTORY = join(__dirname, 'public', 'changelog')
const CHANGELOG_ASSET_FILE = join(CHANGELOG_ASSET_DIRECTORY, 'latest.json')

interface ChangelogFeedItem {
  name: string
  summary: string
  url: string
  firstPublishedAt: string
}

async function writeChangelogAssetFile(changelogs: ChangelogFeedItem[]) {
  await mkdir(CHANGELOG_ASSET_DIRECTORY, { recursive: true })
  await writeFile(CHANGELOG_ASSET_FILE, JSON.stringify(changelogs, null, 2) + '\n')
}

async function ensureFallbackChangelogAssetFile() {
  try {
    await stat(CHANGELOG_ASSET_FILE)
  } catch {
    await writeChangelogAssetFile([])
  }
}

function decodeXmlEntities(value: string) {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim()
}

function extractXmlTagValue(xml: string, tagName: string) {
  const match = xml.match(new RegExp(`<${tagName}>([\\s\\S]*?)<\\/${tagName}>`))
  return match ? decodeXmlEntities(match[1]) : undefined
}

function extractPublishedAtFromChangelogUrl(url: string) {
  const dateMatch = url.match(/\/changelog\/(\d{4}-\d{2}-\d{2})(?:$|[/?#-])/)

  if (!dateMatch) {
    return undefined
  }

  return `${dateMatch[1]}T00:00:00.000Z`
}

async function syncChangelogFeed() {
  try {
    const response = await fetch(CHANGELOG_RSS_FEED_URL, {
      headers: {
        Accept: 'application/rss+xml, application/xml, text/xml',
      },
    })

    if (!response.ok) {
      throw new Error(`Qovery changelog RSS error: ${response.status} ${response.statusText}`)
    }

    const rssFeed = await response.text()
    const latestItem = rssFeed.match(/<item>([\s\S]*?)<\/item>/)?.[1]

    if (!latestItem) {
      await writeChangelogAssetFile([])
      return
    }

    const name = extractXmlTagValue(latestItem, 'title') ?? ''
    const url = extractXmlTagValue(latestItem, 'link')
    const summary = extractXmlTagValue(latestItem, 'description') ?? ''
    const publishedAt = extractXmlTagValue(latestItem, 'pubDate')

    if (!url || !publishedAt) {
      await writeChangelogAssetFile([])
      return
    }

    const parsedPublishedAt = new Date(publishedAt)
    const firstPublishedAtFromUrl = extractPublishedAtFromChangelogUrl(url)
    const changelogs = [
      {
        name,
        summary,
        url,
        firstPublishedAt:
          firstPublishedAtFromUrl ??
          (Number.isNaN(parsedPublishedAt.getTime()) ? publishedAt : parsedPublishedAt.toISOString()),
      },
    ]

    await writeChangelogAssetFile(changelogs)
  } catch (error) {
    console.warn('Unable to refresh Qovery changelog RSS asset.', error)
    await ensureFallbackChangelogAssetFile()
  }
}

export default defineConfig(async ({ mode }) => {
  const clientEnv = loadEnv(mode, process.cwd(), '')
  await syncChangelogFeed()

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
