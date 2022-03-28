import React from 'react'
import { render } from '__tests__/utils/setup-jest'

import LayoutOnboarding from './layout-onboarding'

describe('LayoutOnboarding', () => {
  it('should render successfully', () => {
    const children = React.createElement('div')

    const { baseElement } = render(<LayoutOnboarding routes={[]} children={children} />)
    expect(baseElement).toBeTruthy()
  })
})
