import { render } from '@testing-library/react'

import Onboarding from './onboarding'

describe('Onboarding', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<Onboarding />)
    expect(baseElement).toBeTruthy()
  })
})
