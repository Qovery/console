import { renderWithRouter } from '__mocks__/utils/test-utils'

import StepPricing from './step-pricing'

describe('StepPricing', () => {
  it('should render successfully', () => {
    const { baseElement } = renderWithRouter(<StepPricing />)
    expect(baseElement).toBeTruthy()
  })
})
