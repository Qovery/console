import { configureStore } from '@reduxjs/toolkit'
import { ComponentType, ReactNode } from 'react'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import { initialRootState, rootReducer, RootState } from '../../libs/store/data/src'
import React from 'react'
import { Auth0Provider } from '@auth0/auth0-react'

type Params = {
  Component: ComponentType<any>
  compProps?: Record<string, unknown>
  reduxState?: Partial<RootState>
  route?: string
}

type Props = {
  children: ReactNode
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
        <MemoryRouter>{children}</MemoryRouter>
      </Provider>
    </Auth0Provider>
  )
}
