import { render } from '__tests__/utils/setup-jest'

import LayoutLogin from './layout-login'
import React from 'react'

describe('LayoutLogin', () => {
  it('should render successfully', () => {
    const children = React.createElement('div')
    const { baseElement } = render(<LayoutLogin children={children} />)
    expect(baseElement).toBeTruthy()
  })
})
