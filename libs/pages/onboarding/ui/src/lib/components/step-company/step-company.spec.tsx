import { render } from '@testing-library/react'

import StepCompany from './step-company'

describe('StepCompany', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<StepCompany />)
    expect(baseElement).toBeTruthy()
  })
})
