import { Auth0Provider } from '@auth0/auth0-react'
import * as TooltipPrimitive from '@radix-ui/react-tooltip'
import { configureStore } from '@reduxjs/toolkit'
import posthog from 'posthog-js'
import React, { ComponentType, ReactNode } from 'react'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import { ModalProvider } from '@qovery/shared/ui'
import { RootState, initialRootState, rootReducer } from '@qovery/store'

type Params = {
  Component?: ComponentType<any>
  compProps?: Record<string, unknown>
  reduxState?: Partial<RootState>
  route?: string
}

export type Props = {
  children?: ReactNode
} & Omit<Params, 'Component'>

export const Wrapper: React.FC<Props> = ({ children, reduxState = initialRootState(), route = '/' }) => {
  window.history.pushState({}, 'Test page', route)

  posthog.init('__test__posthog__token', {
    api_host: '__test__environment__posthog__apihost',
  })

  const store = configureStore({
    reducer: rootReducer,
    preloadedState: reduxState,
  })

  return (
    <Auth0Provider clientId="__test_client_id__" domain="__test_domain__">
      <Provider store={store}>
        <TooltipPrimitive.Provider>
          <ModalProvider>
            <MemoryRouter>{children}</MemoryRouter>
          </ModalProvider>
        </TooltipPrimitive.Provider>
      </Provider>
    </Auth0Provider>
  )
}
