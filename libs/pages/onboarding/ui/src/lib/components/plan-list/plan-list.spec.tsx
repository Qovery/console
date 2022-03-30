import { render } from '@testing-library/react'

import PlanList from './plan-list'

describe('PlanList', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PlanList />)
    expect(baseElement).toBeTruthy()
  })
})
