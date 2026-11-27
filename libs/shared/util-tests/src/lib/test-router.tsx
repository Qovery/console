import { RouterContextProvider, createMemoryHistory, createRootRoute, createRouter } from '@tanstack/react-router'
import { type PropsWithChildren, useState } from 'react'

/** Synchronous context for isolated component tests; use renderWithRouter for navigation tests. */
export function TestRouter({ children, route = '/' }: PropsWithChildren<{ route?: string }>) {
  const [router] = useState(() =>
    createRouter({ routeTree: createRootRoute(), history: createMemoryHistory({ initialEntries: [route] }) })
  )
  return <RouterContextProvider router={router}>{children}</RouterContextProvider>
}
