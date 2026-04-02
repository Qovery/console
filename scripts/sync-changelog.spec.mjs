import assert from 'node:assert/strict'
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { after, describe, it } from 'node:test'
import {
  extractPublishedAtFromChangelogUrl,
  parseLatestChangelogFromRssFeed,
  syncChangelogFeed,
} from './sync-changelog.mjs'

const rssFeed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <item>
      <title><![CDATA[Qovery Changelogs]]></title>
      <link>https://www.qovery.com/changelog/2026-04-01</link>
      <description><![CDATA[Terraform &amp; ingress updates]]></description>
      <pubDate>Wed, 01 Apr 2026 09:00:00 GMT</pubDate>
    </item>
  </channel>
</rss>`

const tempDirectories = []

after(async () => {
  await Promise.all(tempDirectories.map((directory) => rm(directory, { recursive: true, force: true })))
})

async function createTempAssetFile(content) {
  const directory = await mkdtemp(join(tmpdir(), 'sync-changelog-'))
  const assetFile = join(directory, 'latest.json')

  tempDirectories.push(directory)

  if (content !== undefined) {
    await writeFile(assetFile, content)
  }

  return assetFile
}

describe('sync changelog', () => {
  it('extracts the publish date from changelog URLs', () => {
    assert.equal(
      extractPublishedAtFromChangelogUrl('https://www.qovery.com/changelog/2026-04-01'),
      '2026-04-01T00:00:00.000Z'
    )
    assert.equal(extractPublishedAtFromChangelogUrl('https://www.qovery.com/changelog/not-a-date'), undefined)
  })

  it('parses the latest changelog from the RSS feed', () => {
    assert.deepEqual(parseLatestChangelogFromRssFeed(rssFeed), [
      {
        name: 'Qovery Changelogs',
        summary: 'Terraform & ingress updates',
        url: 'https://www.qovery.com/changelog/2026-04-01',
        firstPublishedAt: '2026-04-01T00:00:00.000Z',
      },
    ])
  })

  it('writes the latest changelog asset when the feed is available', async () => {
    const assetFile = await createTempAssetFile()

    const changelogs = await syncChangelogFeed({
      changelogAssetFile: assetFile,
      fetchImpl: async () => ({
        ok: true,
        text: async () => rssFeed,
      }),
      consoleWarn: () => {
        throw new Error('consoleWarn should not be called when sync succeeds')
      },
    })

    assert.deepEqual(changelogs, [
      {
        name: 'Qovery Changelogs',
        summary: 'Terraform & ingress updates',
        url: 'https://www.qovery.com/changelog/2026-04-01',
        firstPublishedAt: '2026-04-01T00:00:00.000Z',
      },
    ])
    assert.deepEqual(JSON.parse(await readFile(assetFile, 'utf8')), changelogs)
  })

  it('keeps the previous changelog asset outside strict mode when the RSS fetch fails', async () => {
    const existingChangelog = [
      {
        name: 'Existing changelog',
        summary: 'Older release note',
        url: 'https://www.qovery.com/changelog/2026-03-11',
        firstPublishedAt: '2026-03-11T00:00:00.000Z',
      },
    ]
    const warnings = []
    const assetFile = await createTempAssetFile(JSON.stringify(existingChangelog, null, 2))

    await syncChangelogFeed({
      changelogAssetFile: assetFile,
      fetchImpl: async () => {
        throw new Error('fetch failed')
      },
      strictMode: false,
      consoleWarn: (...args) => warnings.push(args),
    })

    assert.equal(warnings.length, 1)
    assert.deepEqual(JSON.parse(await readFile(assetFile, 'utf8')), existingChangelog)
  })

  it('fails in strict mode when the RSS fetch fails', async () => {
    const assetFile = await createTempAssetFile('[]\n')

    await assert.rejects(
      syncChangelogFeed({
        changelogAssetFile: assetFile,
        fetchImpl: async () => {
          throw new Error('fetch failed')
        },
        strictMode: true,
      }),
      /fetch failed/
    )
    assert.deepEqual(JSON.parse(await readFile(assetFile, 'utf8')), [])
  })
})
