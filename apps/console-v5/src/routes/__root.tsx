import { type QueryClient } from '@tanstack/react-query'
import { Outlet, createRootRouteWithContext } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { ModalProvider, ToastBehavior } from '@qovery/shared/ui'
import { type Auth0ContextType } from '../auth/auth0'

interface RouterContext {
  auth: Auth0ContextType
  queryClient: QueryClient
}

const RootLayout = () => {
  return (
    <>
      <ModalProvider>
        <Outlet />
        <ToastBehavior />
      </ModalProvider>
      <TanStackRouterDevtools />
    </>
  )
}

export const Route = createRootRouteWithContext<RouterContext>()({ component: RootLayout })
