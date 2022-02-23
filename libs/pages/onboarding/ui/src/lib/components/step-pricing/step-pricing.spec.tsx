import { render } from '@testing-library/react'

import StepPricing from './step-pricing'

describe('StepPricing', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<StepPricing />)
    expect(baseElement).toBeTruthy()
  })
})
