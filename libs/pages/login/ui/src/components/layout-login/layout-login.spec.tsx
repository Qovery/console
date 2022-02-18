import { render } from '@testing-library/react'

import LayoutLogin from './layout-login'

describe('LayoutLogin', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<LayoutLogin />)
    expect(baseElement).toBeTruthy()
  })
})
