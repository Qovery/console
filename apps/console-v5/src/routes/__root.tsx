import { type QueryClient } from '@tanstack/react-query'
import { Outlet, createRootRouteWithContext } from '@tanstack/react-router'
import { ModalProvider, ToastBehavior } from '@qovery/shared/ui'
import { UseCaseBottomBar } from '../app/components/use-cases/use-case-bottom-bar'
import { UseCaseProvider } from '../app/components/use-cases/use-case-context'
import { type Auth0ContextType } from '../auth/auth0'

interface RouterContext {
  auth: Auth0ContextType
  queryClient: QueryClient
}

const RootLayout = () => {
  return (
    <UseCaseProvider>
      <ModalProvider>
        <Outlet />
        <ToastBehavior />
        <UseCaseBottomBar />
      </ModalProvider>
    </UseCaseProvider>
  )
}

export const Route = createRootRouteWithContext<RouterContext>()({ component: RootLayout })
