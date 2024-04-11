import algoliasearch from 'algoliasearch/lite'
import { type ReactNode } from 'react'
import { Configure, InstantSearch } from 'react-instantsearch'

// TODO turn into env var
const ALGOLIA_APP_ID = 'FT65SBJ2DA'
const ALGOLIA_API_KEY = '02604e8b2e0918e90edd1d9eb8e30f5e'
const searchClient = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_API_KEY)

export function InstantSearchProvider({ children }: { children: ReactNode }) {
  return (
    <InstantSearch searchClient={searchClient} indexName="qovery">
      <Configure
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
