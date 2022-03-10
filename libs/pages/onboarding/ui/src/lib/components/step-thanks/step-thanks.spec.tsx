import { render } from '@testing-library/react'

import StepThanks from './step-thanks'

describe('StepThanks', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<StepThanks />)
    expect(baseElement).toBeTruthy()
  })
})
