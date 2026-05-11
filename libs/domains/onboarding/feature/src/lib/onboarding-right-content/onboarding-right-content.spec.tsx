import { render } from '__tests__/utils/setup-jest'
import OnboardingRightContent, { type OnboardingRightContentProps } from './onboarding-right-content'

describe('OnboardingRightContent', () => {
  let props: OnboardingRightContentProps

  beforeEach(() => {
    props = {
      step: '1',
    }
  })

  it('should render successfully', () => {
    const { baseElement } = render(<OnboardingRightContent {...props} />)
    expect(baseElement).toBeTruthy()
  })
})
