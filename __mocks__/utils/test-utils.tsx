import '@testing-library/jest-dom'
import { render, RenderOptions } from '@testing-library/react'
import React from 'react'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import { store } from '../../apps/console/src/main'
import { server } from '../server'

beforeAll(() => server.listen())

afterEach(() => server.resetHandlers())

afterAll(() => server.close())

const Wrapper: React.FC = ({ children }) => <Provider store={store}></Provider>

const RouterWrapper: React.FC = ({ children }) => (
  <Provider store={store}>
    <MemoryRouter>{children}</MemoryRouter>
  </Provider>
)

const customRender = (ui: React.ReactElement, options?: Omit<RenderOptions, 'wrapper'>) =>
  render(ui, { wrapper: Wrapper, ...options })

const renderWithRouter = (ui: React.ReactElement, { route = '/' } = {}, options?: Omit<RenderOptions, 'wrapper'>) => {
  window.history.pushState({}, 'Test page', route)

  return render(ui, { wrapper: RouterWrapper, ...options })
}

export * from '@testing-library/react'

export { customRender as render }

export default renderWithRouter
