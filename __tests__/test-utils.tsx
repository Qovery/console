import React from 'react'
import { render as rtlRender, RenderOptions } from '@testing-library/react'
import { Store } from 'redux'
import { Provider } from 'react-redux'
import thunk from 'redux-thunk'
import configureStore from 'redux-mock-store'
import { RootState } from '../apps/console/src/main'

interface ExtendedRenderOptions extends RenderOptions {
  initialState?: Partial<RootState>
  store?: Store<Partial<RootState>>
}

const TestWrapper =
  (store: Store) =>
  ({ children }: { children?: React.ReactNode }) =>
    <Provider store={store}>{children}</Provider>

const render = (
  component: any,
  {
    initialState,
    store = configureStore<Partial<RootState>>([thunk])(initialState),
    ...renderOptions
  }: ExtendedRenderOptions = {
    initialState: {},
  }
) => {
  return rtlRender(component, {
    wrapper: TestWrapper(store),
    ...renderOptions,
  })
}

export * from '@testing-library/react'

export { render }
