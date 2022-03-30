import { render } from '@testing-library/react'

import StepPersonalize from './step-personalize'

describe('StepPersonalize', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<StepPersonalize />)
    expect(baseElement).toBeTruthy()
  })
})
