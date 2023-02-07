import { render } from '@testing-library/react'
import StepRemote from './step-remote'

describe('StepRemote', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<StepRemote />)
    expect(baseElement).toBeTruthy()
  })
})
