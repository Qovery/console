import { render } from '@testing-library/react'
import StepResources from './step-resources'

describe('StepResources', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<StepResources />)
    expect(baseElement).toBeTruthy()
  })
})
