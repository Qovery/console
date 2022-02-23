import { render } from '__mocks__/utils/test-utils'

import LayoutOnboarding from './layout-onboarding'

describe('LayoutOnboarding', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<LayoutOnboarding />)
    expect(baseElement).toBeTruthy()
  })
})
