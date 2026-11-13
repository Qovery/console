import { Auth0Provider } from '@auth0/auth0-react'
import { Provider as TooltipProvider } from '@radix-ui/react-tooltip'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { type ComponentType, type ReactNode, useState } from 'react'
import { ModalProvider } from '@qovery/shared/ui'
import { TestRouter } from '../../libs/shared/util-tests/src/lib/test-router'
import ResizeObserver from './resize-observer'

type Params = {
  Component?: ComponentType<any>
  compProps?: Record<string, unknown>
  route?: string
}

export type Props = {
  children?: ReactNode
} & Omit<Params, 'Component'>

export const Wrapper = ({ children, route = '/' }: Props) => {
  const [queryClient] = useState(() => new QueryClient({ defaultOptions: { queries: { retry: false } } }))
  window.history.pushState({}, 'Test page', route)
  window.ResizeObserver = ResizeObserver

  return (
    <Auth0Provider clientId="__test_client_id__" domain="__test_domain__">
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <ModalProvider>
            <TestRouter route={route}>{children}</TestRouter>
          </ModalProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </Auth0Provider>
  )
}
