import { render } from '__mocks__/utils/test-utils'

import PlanCard from './plan-card'

describe('PlanCard', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PlanCard />)
    expect(baseElement).toBeTruthy()
  })
})
