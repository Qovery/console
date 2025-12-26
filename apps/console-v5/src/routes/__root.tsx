import { type QueryClient } from '@tanstack/react-query'
import { Outlet, createRootRouteWithContext } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { type Auth0ContextType } from '../auth/auth0'

interface RouterContext {
  auth: Auth0ContextType
  queryClient: QueryClient
}

const RootLayout = () => {
  return (
    <>
      <Outlet />
      <TanStackRouterDevtools />
    </>
  )
}

export const Route = createRootRouteWithContext<RouterContext>()({ component: RootLayout })
