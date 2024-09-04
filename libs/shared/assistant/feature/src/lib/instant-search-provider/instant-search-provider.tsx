import algoliasearch from 'algoliasearch/lite'
import { type ReactNode } from 'react'
import { Configure, InstantSearch } from 'react-instantsearch'
import { ALGOLIA_API_KEY, ALGOLIA_APP_ID } from '@qovery/shared/util-node-env'

let searchClient: ReturnType<typeof algoliasearch> | undefined
if (ALGOLIA_APP_ID && ALGOLIA_API_KEY) {
  searchClient = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_API_KEY)
}

export function InstantSearchProvider({ children }: { children: ReactNode }) {
  if (!searchClient) {
    return <>{children}</>
  }
  return (
    <InstantSearch searchClient={searchClient} indexName="qovery">
      <Configure
        // @ts-expect-error The `<Configure>` component of `react-instantsearch` isn't properly typed. Even documented parameters do not compile. We must ignore those params https://www.algolia.com/doc/guides/building-search-ui/widgets/customize-an-existing-widget/react/#manually-set-search-parameters
        maxValuesPerFacet={10}
        attributesToRetrieve={[
          'hierarchy.lvl0',
          'hierarchy.lvl1',
          'hierarchy.lvl2',
          'hierarchy.lvl3',
          'hierarchy.lvl4',
          'hierarchy.lvl5',
          'hierarchy.lvl6',
          'content',
          'type',
          'url',
        ]}
        attributesToSnippet={[
          `hierarchy.lvl1:10`,
          `hierarchy.lvl2:10`,
          `hierarchy.lvl3:10`,
          `hierarchy.lvl4:10`,
          `hierarchy.lvl5:10`,
          `hierarchy.lvl6:10`,
          `content:10`,
        ]}
      />
      {children}
    </InstantSearch>
  )
}

export default InstantSearchProvider
