/**
 * This file is inspired by
 * - https://testing-library.com/docs/react-testing-library/setup
 */
import { Auth0Provider } from '@auth0/auth0-react'
import { ResizeObserver } from '@juggle/resize-observer'
import { Provider as TooltipProvider } from '@radix-ui/react-tooltip'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import '@testing-library/jest-dom'
// eslint-disable-next-line @typescript-eslint/no-restricted-imports
import { type RenderOptions, queries, render, screen, within } from '@testing-library/react'
// eslint-disable-next-line @typescript-eslint/no-restricted-imports
import userEvent from '@testing-library/user-event'
import { type PropsWithChildren, type ReactElement } from 'react'
import { useChainProviders } from 'react-flat-providers'
import { InstantSearch } from 'react-instantsearch'
import { MemoryRouter } from 'react-router-dom'
import { QueryParamProvider } from 'use-query-params'
import { ReactRouter6Adapter } from 'use-query-params/adapters/react-router-6'
// eslint-disable-next-line @nx/enforce-module-boundaries
import { ModalProvider } from '@qovery/shared/ui'

const allQueries = {
  ...queries,
  // TODO: add custom queries here
}

const customScreen = { ...screen, ...within(document.body, allQueries) }
const customWithin = (element: HTMLElement) => within(element, allQueries)

/**
 * Custom testing-library/react render function providing by default
 * all providers and setting up userEvent
 */
function renderWithProviders(
  ui: ReactElement,
  { ...renderOptions }: RenderOptions = {}
): { userEvent: ReturnType<typeof userEvent.setup> } & ReturnType<typeof render> {
  function Wrapper({ children }: PropsWithChildren) {
    const queryClient = new QueryClient()
    const FlatChainedProviders = useChainProviders()
      .add(Auth0Provider, { clientId: '__test_client_id__', domain: '__test_domain__' })
      .add(QueryClientProvider, { client: queryClient })
      .add(TooltipProvider)
      .add(ModalProvider)
      .add(MemoryRouter)
      .add(QueryParamProvider, {
        adapter: ReactRouter6Adapter,
      })
      .add(InstantSearch, {
        // Mock InstantSearch client
        // Inspired from https://github.com/algolia/react-instantsearch/issues/3609#issuecomment-1239027418
        searchClient: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          async search(queries: any) {
            return {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              results: queries.map(({ indexName, params }: any) => ({
                hits: [],
                page: 0,
                nbHits: 0,
                nbPages: 0,
                hitsPerPage: 0,
                processingTimeMS: 1,
                exhaustiveNbHits: true,
                query: params.query,
                params: '',
              })),
            }
          },
        },
      })
      .make()

    return <FlatChainedProviders>{children}</FlatChainedProviders>
  }

  window.ResizeObserver = ResizeObserver

  return {
    userEvent: userEvent.setup(),
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
  }
}

// eslint-disable-next-line @typescript-eslint/no-restricted-imports
export * from '@testing-library/react'
export { customScreen as screen, customWithin as within, renderWithProviders }
