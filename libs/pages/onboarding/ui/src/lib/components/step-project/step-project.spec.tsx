import { render } from '__tests__/utils/setup-jest'

import StepProject from './step-project'

describe('StepProject', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<StepProject />)

    expect(baseElement).toBeTruthy()
  })
})
