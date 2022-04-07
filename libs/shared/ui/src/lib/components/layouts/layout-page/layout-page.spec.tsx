import { render } from '__tests__/utils/setup-jest'

import LayoutPage, { LayoutPageProps } from './layout-page'
import React from 'react'

describe('LayoutPage', () => {
  let props: LayoutPageProps

  beforeEach(() => {
    props = {
      children: React.createElement('div'),
    }
  })

  it('should render successfully', () => {
    const { baseElement } = render(<LayoutPage {...props} />)
    expect(baseElement).toBeTruthy()
  })
})
