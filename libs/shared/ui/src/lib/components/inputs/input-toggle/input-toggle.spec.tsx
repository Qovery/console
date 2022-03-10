import { render } from '@testing-library/react'

import InputToggle from './input-toggle'

describe('InputToggle', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<InputToggle />)
    expect(baseElement).toBeTruthy()
  })
})
