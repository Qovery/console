import { render } from '__tests__/utils/setup-jest'
import PageOnboarding from './page-onboarding'

describe('PageOnboarding', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PageOnboarding />)
    expect(baseElement).toBeTruthy()
  })
})
