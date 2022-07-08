import '@testing-library/jest-dom'
import { cleanup, render, RenderOptions } from '@testing-library/react'
import React from 'react'
import { server } from '../server'
import { Wrapper } from './providers'

beforeAll(() =>
  server.listen({
    onUnhandledRequest: ({ method, url }) => {
      if (url.pathname.indexOf('__test') === -1) {
        throw new Error(`Unhandled ${method} request to ${url}`)
      }
    },
  })
)

afterEach(() => {
  server.resetHandlers()
  cleanup()
})

afterAll(() => server.close())

type CustomRenderOptions = {
  wrapperProps?: {}
} & Omit<RenderOptions, 'wrapper'>

const customRender = (ui: React.ReactElement, options?: CustomRenderOptions) =>
  render(ui, { wrapper: (props) => <Wrapper {...props} {...options?.wrapperProps} />, ...options })

export * from '@testing-library/react'

export { customRender as render }
