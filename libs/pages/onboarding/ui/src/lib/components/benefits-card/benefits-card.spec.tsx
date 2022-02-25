import { render } from '@testing-library/react'

import BenefitsCard from './benefits-card'

describe('BenefitsCard', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<BenefitsCard />)
    expect(baseElement).toBeTruthy()
  })
})
