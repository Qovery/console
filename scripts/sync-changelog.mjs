import { mkdir, stat, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const CHANGELOG_RSS_FEED_URL = 'https://www.qovery.com/changelog/rss.xml'
const __dirname = dirname(fileURLToPath(import.meta.url))
const CHANGELOG_ASSET_FILE = resolve(__dirname, '../apps/console-v5/public/changelog/latest.json')

function decodeXmlEntities(value) {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim()
}

function extractXmlTagValue(xml, tagName) {
  const match = xml.match(new RegExp(`<${tagName}>([\\s\\S]*?)<\\/${tagName}>`))
  return match ? decodeXmlEntities(match[1]) : undefined
}

function extractPublishedAtFromChangelogUrl(url) {
  const dateMatch = url.match(/\/changelog\/(\d{4}-\d{2}-\d{2})(?:$|[/?#-])/)

  if (!dateMatch) {
    return undefined
  }

  return `${dateMatch[1]}T00:00:00.000Z`
}

async function writeChangelogAssetFile(changelogs) {
  await mkdir(dirname(CHANGELOG_ASSET_FILE), { recursive: true })
  await writeFile(CHANGELOG_ASSET_FILE, JSON.stringify(changelogs, null, 2) + '\n')
}

async function ensureFallbackChangelogAssetFile() {
  try {
    await stat(CHANGELOG_ASSET_FILE)
  } catch {
    await writeChangelogAssetFile([])
  }
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

    await writeChangelogAssetFile([
      {
        name,
        summary,
        url,
        firstPublishedAt:
          firstPublishedAtFromUrl ??
          (Number.isNaN(parsedPublishedAt.getTime()) ? publishedAt : parsedPublishedAt.toISOString()),
      },
    ])
  } catch (error) {
    console.warn('Unable to refresh Qovery changelog RSS asset.', error)
    await ensureFallbackChangelogAssetFile()
  }
}

await syncChangelogFeed()
