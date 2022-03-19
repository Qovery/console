import { render } from '__tests__/utils/setup-jest'

import InputToggle from './input-toggle'

describe('InputToggle', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<InputToggle />)
    expect(baseElement).toBeTruthy()
  })
})
