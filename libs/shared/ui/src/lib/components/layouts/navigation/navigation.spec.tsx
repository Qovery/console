import { render } from '__tests__/utils/setup-jest'

import Navigation from './navigation'

describe('Navigation', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<Navigation />)
    expect(baseElement).toBeTruthy()
  })
})
