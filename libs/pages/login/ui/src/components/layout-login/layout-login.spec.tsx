import { renderWithRouter } from '__mocks__/utils/test-utils'

import LayoutLogin from './layout-login'
import React from 'react'

describe('LayoutLogin', () => {
  it('should render successfully', () => {
    const children = React.createElement('div')
    const { baseElement } = renderWithRouter(<LayoutLogin children={children} />)
    expect(baseElement).toBeTruthy()
  })
})
