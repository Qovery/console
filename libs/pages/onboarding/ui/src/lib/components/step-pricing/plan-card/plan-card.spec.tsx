import { render } from '@testing-library/react'

import PlanCard from './plan-card'

describe('PlanCard', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PlanCard />)
    expect(baseElement).toBeTruthy()
  })
})
