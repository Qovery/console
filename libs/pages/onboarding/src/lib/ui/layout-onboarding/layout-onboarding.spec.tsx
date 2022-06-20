import React from 'react'
import { render } from '__tests__/utils/setup-jest'

import LayoutOnboarding, { LayoutOnboardingProps } from './layout-onboarding'

describe('LayoutOnboarding', () => {
  let props: LayoutOnboardingProps

  beforeEach(() => {
    props = {
      children: React.createElement('div'),
      currentStepPosition: 1,
      stepsNumber: 5,
      getProgressPercentValue: 20,
      step: '1',
      routes: [],
    }
  })
  it('should render successfully', () => {
    const { baseElement } = render(<LayoutOnboarding {...props} />)
    expect(baseElement).toBeTruthy()
  })
})
