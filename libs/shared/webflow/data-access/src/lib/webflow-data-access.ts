import { createQueryKeys } from '@lukemorales/query-key-factory'

export interface Changelog {
  name: string
  summary: string
  url: string
  firstPublishedAt: string
}

const CHANGELOG_ASSET_PATH = '/changelog/latest.json'

export const webflow = createQueryKeys('webflow', {
  changelogs: {
    queryKey: [CHANGELOG_ASSET_PATH],
    async queryFn() {
      const response = await fetch(CHANGELOG_ASSET_PATH, {
        headers: {
          Accept: 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`Webflow API error: ${response.status} ${response.statusText}`)
      }

      const data = (await response.json()) as Changelog[]
      return data
    },
  },
})
