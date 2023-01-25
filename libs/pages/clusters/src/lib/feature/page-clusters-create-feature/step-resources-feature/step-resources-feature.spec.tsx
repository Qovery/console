import { render } from '@testing-library/react'
import StepResourcesFeature from './step-resources-feature'

describe('StepResourcesFeature', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<StepResourcesFeature />)
    expect(baseElement).toBeTruthy()
  })
})
