import { render } from '__tests__/utils/setup-jest'
import StepThanks from './step-thanks'

describe('StepThanks', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<StepThanks />)
    expect(baseElement).toBeTruthy()
  })
})
