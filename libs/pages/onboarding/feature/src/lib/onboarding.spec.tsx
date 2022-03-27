import { render } from '__tests__/utils/setup-jest'

import Onboarding from './onboarding'

describe('Onboarding', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<Onboarding />)
    expect(baseElement).toBeTruthy()
  })
})
