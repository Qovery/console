import React from 'react'
import { render } from '__tests__/utils/setup-jest'

import Layout, { LayoutProps } from './layout'

describe('Layout', () => {
  let props: LayoutProps

  beforeEach(() => {
    props = {
      children: React.createElement('div'),
    }
  })

  it('should render successfully', () => {
    const { baseElement } = render(<Layout {...props} />)
    expect(baseElement).toBeTruthy()
  })
})
