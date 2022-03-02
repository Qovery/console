import { render } from '__mocks__/utils/test-utils'

import BenefitsCard from './benefits-card'

describe('BenefitsCard', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<BenefitsCard />)
    expect(baseElement).toBeTruthy()
  })
})
