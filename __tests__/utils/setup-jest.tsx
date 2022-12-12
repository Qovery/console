import '@testing-library/jest-dom'
import { RenderOptions, render } from '@testing-library/react'
import React from 'react'
import { Props, Wrapper } from './providers'

type CustomRenderOptions = {
  wrapperProps?: Props
} & Omit<RenderOptions, 'wrapper'>

const customRender = (ui: React.ReactElement, options?: CustomRenderOptions) =>
  render(ui, { wrapper: (props) => <Wrapper {...props} {...options?.wrapperProps} />, ...options })

export * from '@testing-library/react'

export { customRender as render }
