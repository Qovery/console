import '@testing-library/jest-dom'
import { render, RenderOptions } from '@testing-library/react'
import React from 'react'
import { server } from '../server'
import { Wrapper } from './providers'

beforeAll(() => server.listen())

afterEach(() => server.resetHandlers())

afterAll(() => server.close())

type CustomRenderOptions = {
  wrapperProps: {}
} & Omit<RenderOptions, 'wrapper'>

const customRender = (ui: React.ReactElement, options?: CustomRenderOptions) =>
  render(ui, { wrapper: (props) => <Wrapper {...props} {...options?.wrapperProps} />, ...options })

export * from '@testing-library/react'

export { customRender as render }
