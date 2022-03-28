import { render } from '__tests__/utils/setup-jest'

import PlanCard from './plan-card'

describe('PlanCard', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PlanCard />)
    expect(baseElement).toBeTruthy()
  })
})
