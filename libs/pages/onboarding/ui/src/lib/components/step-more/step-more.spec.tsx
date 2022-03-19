import { render } from '__tests__/utils/setup-jest'

import StepMore from './step-more'

describe('StepMore', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<StepMore />)
    expect(baseElement).toBeTruthy()
  })
})
