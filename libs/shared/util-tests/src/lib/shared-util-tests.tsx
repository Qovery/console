/**
 * This file is inspired by
 * - https://testing-library.com/docs/react-testing-library/setup
 * - https://redux.js.org/usage/writing-tests#setting-up-a-test-environment
 */
import { Auth0Provider } from '@auth0/auth0-react'
import { ResizeObserver } from '@juggle/resize-observer'
import { type PreloadedState } from '@reduxjs/toolkit'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import '@testing-library/jest-dom'
// eslint-disable-next-line @typescript-eslint/no-restricted-imports
import { type RenderOptions, queries, render, within } from '@testing-library/react'
// eslint-disable-next-line @typescript-eslint/no-restricted-imports
import userEvent from '@testing-library/user-event'
import { type PropsWithChildren, type ReactElement } from 'react'
import { useChainProviders } from 'react-flat-providers'
import { Provider as ReduxProvider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
// eslint-disable-next-line @nx/enforce-module-boundaries
import { ModalProvider } from '@qovery/shared/ui'
import { type AppStore, type RootState, setupStore } from '@qovery/state/store'

const allQueries = {
  ...queries,
  // TODO: add custom queries here
}

const customScreen = within(document.body, allQueries)
const customWithin = (element: Parameters<typeof within>[0]) => within(element, allQueries)

// This type interface extends the default options for render from RTL, as well
// as allows the user to specify other things such as initialState, store.
interface ExtendedRenderOptions extends RenderOptions {
  preloadedState?: PreloadedState<RootState>
  store?: AppStore
}

/**
 * Custom testing-library/react render function providing by default
 * all providers and setting up userEvent
 */
function renderWithProviders(
  ui: ReactElement,
  {
    preloadedState = {},
    // Automatically create a store instance if no store was passed in
    store = setupStore(preloadedState),
    ...renderOptions
  }: ExtendedRenderOptions = {}
): { userEvent: ReturnType<typeof userEvent.setup> } & ReturnType<typeof render> {
  function Wrapper({ children }: PropsWithChildren) {
    const queryClient = new QueryClient()
    const FlatChainedProviders = useChainProviders()
      .add(Auth0Provider, { clientId: '__test_client_id__', domain: '__test_domain__' })
      .add(QueryClientProvider, { client: queryClient })
      .add(ReduxProvider, { store })
      .add(ModalProvider)
      .add(MemoryRouter)
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
