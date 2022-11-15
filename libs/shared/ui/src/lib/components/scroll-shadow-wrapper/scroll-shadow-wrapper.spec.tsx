import { render } from '@testing-library/react'
import ScrollShadowWrapper from './scroll-shadow-wrapper'

describe('ScrollShadowWrapper', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<ScrollShadowWrapper />)
    expect(baseElement).toBeTruthy()
  })
})
