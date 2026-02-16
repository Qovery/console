import { useQuery } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

interface Changelog {
  name: string
  summary: string
  url: string
  firstPublishedAt: string
}

export function useChangelogs() {
  return useQuery({
    ...queries.webflow.changelogs,
    select: (data) => {
      if (!data?.items || data.items.length === 0) {
        return []
      }

      return data.items.map(
        (item: { fieldData?: { name?: string; summary?: string; slug?: string; ['first-published-at']?: string } }) => {
          const fieldData = item.fieldData || {}
          return {
            name: fieldData.name,
            summary: fieldData.summary,
            url: `https://www.qovery.com/changelog/${fieldData.slug}`,
            firstPublishedAt: fieldData['first-published-at'],
          }
        }
      ) as Changelog[]
    },
  })
}

export default useChangelogs
