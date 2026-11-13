import { RouterProvider, createMemoryHistory, createRootRoute, createRoute, createRouter } from '@tanstack/react-router'
import { type ReactElement, createContext, useContext } from 'react'
import { act, renderWithProviders } from './shared-util-tests'

/**
 * Render against real TanStack routing. Call jest.unmock('@tanstack/react-router') in the suite
 * to opt out of the legacy global hook mocks. The path accepts route parameters (e.g. /projects/$projectId).
 */
export async function renderWithRouter(
  ui: ReactElement,
  { route = '/', path = '$' }: { route?: string; path?: string } = {}
) {
  const Content = createContext(ui)
  function TestPage() {
    return useContext(Content)
  }
  const root = createRootRoute()
  const page = createRoute({ getParentRoute: () => root, path, component: TestPage })
  const router = createRouter({
    routeTree: root.addChildren([page]),
    history: createMemoryHistory({ initialEntries: [route] }),
    defaultPendingMinMs: 0,
  })
  await router.load()
  const withRouter = (element: ReactElement) => (
    <Content.Provider value={element}>
      <RouterProvider router={router} />
    </Content.Provider>
  )
  const result = renderWithProviders(withRouter(ui))
  await act(async () => {
    await router.latestLoadPromise
  })
  return { ...result, router, rerender: (element: ReactElement) => result.rerender(withRouter(element)) }
}
