import { mkdir, stat, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

export const CHANGELOG_PAGE_URL = 'https://www.qovery.com/changelog'
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

export function decodeHtmlEntities(value) {
  return decodeXmlEntities(value)
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([a-f0-9]+);/gi, (_, code) => String.fromCodePoint(parseInt(code, 16)))
    .replace(/&nbsp;/g, ' ')
    .trim()
}

export function stripHtmlTags(value) {
  return decodeHtmlEntities(value)
    .replace(/<script\b[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
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

export function parseLatestChangelogFromHtmlPage(htmlPage) {
  const changelogLinkRegex = /<a\b[^>]*href=["']([^"']*\/changelog\/\d{4}-\d{2}-\d{2}[^"']*)["'][^>]*>([\s\S]*?)<\/a>/gi
  const latestLink = changelogLinkRegex.exec(htmlPage)

  if (!latestLink) {
    return []
  }

  const [, rawUrl, rawLinkContent] = latestLink
  const url = new URL(decodeHtmlEntities(rawUrl), CHANGELOG_PAGE_URL).href
  const firstPublishedAt = extractPublishedAtFromChangelogUrl(url)

  // Extract the title from the <h2> inside the link, fallback to full link content
  const headingMatch = rawLinkContent.match(/<h2\b[^>]*>([\s\S]*?)<\/h2>/i)
  const name = stripHtmlTags(headingMatch ? headingMatch[1] : rawLinkContent)

  if (!name || !firstPublishedAt) {
    return []
  }

  // Extract summary from the first <p> inside the link content
  const pMatch = rawLinkContent.match(/<p\b[^>]*>([\s\S]*?)<\/p>/i)
  const summary = pMatch ? stripHtmlTags(pMatch[1]) : ''

  return [
    {
      name,
      summary,
      url,
      firstPublishedAt,
    },
  ]
}

async function fetchChangelogSource(fetchImpl, url, accept) {
  const response = await fetchImpl(url, {
    headers: {
      Accept: accept,
    },
  })

  if (!response.ok) {
    throw new Error(`Qovery changelog fetch error for ${url}: ${response.status} ${response.statusText}`)
  }

  return response.text()
}

export async function syncChangelogFeed({
  changelogAssetFile = CHANGELOG_ASSET_FILE,
  fetchImpl = fetch,
  strictMode = isStrictChangelogSyncEnabled(),
  consoleWarn = console.warn,
} = {}) {
  try {
    let changelogs = []

    {
      const htmlPage = await fetchChangelogSource(fetchImpl, CHANGELOG_PAGE_URL, 'text/html')
      changelogs = parseLatestChangelogFromHtmlPage(htmlPage)
    }

    if (changelogs.length === 0) {
      throw new Error('Qovery changelog sync did not find any changelog entry')
    }

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
