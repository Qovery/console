import { render } from '@testing-library/react'

import LayoutOnboarding from './layout-onboarding'

describe('LayoutOnboarding', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<LayoutOnboarding />)
    expect(baseElement).toBeTruthy()
  })
})
