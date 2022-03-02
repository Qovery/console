import React from 'react'
import { renderWithRouter } from '__mocks__/utils/test-utils'

import LayoutOnboarding from './layout-onboarding'

describe('LayoutOnboarding', () => {
  it('should render successfully', () => {
    const children = React.createElement('div')

    const { baseElement } = renderWithRouter(<LayoutOnboarding routes={[]} children={children} />)
    expect(baseElement).toBeTruthy()
  })
})
