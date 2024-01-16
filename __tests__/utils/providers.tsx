import { Auth0Provider } from '@auth0/auth0-react'
import { Provider as TooltipProvider } from '@radix-ui/react-tooltip'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { type ComponentType, type ReactNode } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { ModalProvider } from '@qovery/shared/ui'
import ResizeObserver from './resize-observer'

type Params = {
  Component?: ComponentType<any>
  compProps?: Record<string, unknown>
  route?: string
}

export type Props = {
  children?: ReactNode
} & Omit<Params, 'Component'>

const queryClient = new QueryClient()

export const Wrapper = ({ children, route = '/' }: Props) => {
  window.history.pushState({}, 'Test page', route)
  window.ResizeObserver = ResizeObserver

  return (
    <Auth0Provider clientId="__test_client_id__" domain="__test_domain__">
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <ModalProvider>
            <MemoryRouter>{children}</MemoryRouter>
          </ModalProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </Auth0Provider>
  )
}
