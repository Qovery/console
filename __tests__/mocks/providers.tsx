import { combineReducers, configureStore } from '@reduxjs/toolkit'
import { render } from '@testing-library/react'
import React, { ComponentType, FunctionComponent, ReactNode } from 'react'
import { Provider } from 'react-redux'
import { organizations } from '../../libs/domains/organizations/src'
import { user } from '../../libs/domains/user/src'

export type Params = {
  Component: ComponentType<any>
  compProps?: Record<string, unknown>
}

export type Props = {
  children: ReactNode
} & Omit<Params, 'Component'>

export const ProvidersHelper: FunctionComponent<Props> = ({ children }) => {
  const rootReducer = combineReducers({
    user: user,
    organizations: organizations,
  })

  const store = configureStore({
    reducer: rootReducer,
  })

  return <Provider store={store}>{children}</Provider>
}

/**
 * Provide all the ugly-to-set-up providers for your component to be ready to test
 * @param Component
 * @param compProps component properties
 * @param reduxState defaults to initialRootState
 * @param apo
 */
export const providersFactory = ({ Component, compProps = {}, ...props }: Params) =>
  render(
    <ProvidersHelper {...props}>
      <Component {...compProps} />
    </ProvidersHelper>
  )
