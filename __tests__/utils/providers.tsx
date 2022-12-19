import { Auth0Provider } from '@auth0/auth0-react'
import { configureStore } from '@reduxjs/toolkit'
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

  const store = configureStore({
    reducer: rootReducer,
    preloadedState: reduxState,
  })

  return (
    <Auth0Provider clientId="__test_client_id__" domain="__test_domain__">
      <Provider store={store}>
        <ModalProvider>
          <MemoryRouter>{children}</MemoryRouter>
        </ModalProvider>
      </Provider>
    </Auth0Provider>
  )
}
