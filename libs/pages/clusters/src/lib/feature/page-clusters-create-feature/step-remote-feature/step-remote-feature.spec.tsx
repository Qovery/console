import { render } from '@testing-library/react'
import StepRemoteFeature from './step-remote-feature'

describe('StepRemoteFeature', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<StepRemoteFeature />)
    expect(baseElement).toBeTruthy()
  })
})
