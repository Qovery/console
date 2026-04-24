import { mkdir, stat, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

export const CHANGELOG_RSS_FEED_URL = 'https://www.qovery.com/changelog/rss.xml'
const __dirname = dirname(fileURLToPath(import.meta.url))
export const CHANGELOG_ASSET_FILE = resolve(__dirname, '../apps/console/public/changelog/latest.json')

export function decodeXmlEntities(value) {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim()
}

export function extractXmlTagValue(xml, tagName) {
  const match = xml.match(new RegExp(`<${tagName}>([\\s\\S]*?)<\\/${tagName}>`))
  return match ? decodeXmlEntities(match[1]) : undefined
}

export function extractPublishedAtFromChangelogUrl(url) {
  const dateMatch = url.match(/\/changelog\/(\d{4}-\d{2}-\d{2})(?:$|[/?#-])/)

  if (!dateMatch) {
    return undefined
  }

  return `${dateMatch[1]}T00:00:00.000Z`
}

export async function writeChangelogAssetFile(changelogs, changelogAssetFile = CHANGELOG_ASSET_FILE) {
  await mkdir(dirname(changelogAssetFile), { recursive: true })
  await writeFile(changelogAssetFile, JSON.stringify(changelogs, null, 2) + '\n')
}

export async function ensureFallbackChangelogAssetFile(changelogAssetFile = CHANGELOG_ASSET_FILE) {
  try {
    await stat(changelogAssetFile)
  } catch {
    await writeChangelogAssetFile([], changelogAssetFile)
  }
}

export function isStrictChangelogSyncEnabled(env = process.env) {
  return env.QOVERY_CHANGELOG_SYNC_STRICT === '1' || env.QOVERY_CHANGELOG_SYNC_STRICT === 'true'
}

export function parseLatestChangelogFromRssFeed(rssFeed) {
  const latestItem = rssFeed.match(/<item>([\s\S]*?)<\/item>/)?.[1]

  if (!latestItem) {
    return []
  }

  const name = extractXmlTagValue(latestItem, 'title') ?? ''
  const url = extractXmlTagValue(latestItem, 'link')
  const summary = extractXmlTagValue(latestItem, 'description') ?? ''
  const publishedAt = extractXmlTagValue(latestItem, 'pubDate')

  if (!url || !publishedAt) {
    return []
  }

  const parsedPublishedAt = new Date(publishedAt)
  const firstPublishedAtFromUrl = extractPublishedAtFromChangelogUrl(url)

  return [
    {
      name,
      summary,
      url,
      firstPublishedAt:
        firstPublishedAtFromUrl ??
        (Number.isNaN(parsedPublishedAt.getTime()) ? publishedAt : parsedPublishedAt.toISOString()),
    },
  ]
}

export async function syncChangelogFeed({
  changelogAssetFile = CHANGELOG_ASSET_FILE,
  fetchImpl = fetch,
  strictMode = isStrictChangelogSyncEnabled(),
  consoleWarn = console.warn,
} = {}) {
  try {
    const response = await fetchImpl(CHANGELOG_RSS_FEED_URL, {
      headers: {
        Accept: 'application/rss+xml, application/xml, text/xml',
      },
    })

    if (!response.ok) {
      throw new Error(`Qovery changelog RSS error: ${response.status} ${response.statusText}`)
    }

    const rssFeed = await response.text()
    const changelogs = parseLatestChangelogFromRssFeed(rssFeed)
    await writeChangelogAssetFile(changelogs, changelogAssetFile)
    return changelogs
  } catch (error) {
    if (strictMode) {
      throw error
    }

    consoleWarn('Unable to refresh Qovery changelog RSS asset.', error)
    await ensureFallbackChangelogAssetFile(changelogAssetFile)
    return undefined
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await syncChangelogFeed()
}
