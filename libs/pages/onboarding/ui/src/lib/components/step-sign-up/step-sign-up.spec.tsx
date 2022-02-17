import { render } from '@testing-library/react'

import StepSignUp from './step-sign-up'

describe('StepSignUp', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<StepSignUp />)
    expect(baseElement).toBeTruthy()
  })
})
