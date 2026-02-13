import { render } from '__tests__/utils/setup-jest'
import BenefitsCard from './benefits-card'

describe('BenefitsCard', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<BenefitsCard />)
    expect(baseElement).toBeTruthy()
  })
})
