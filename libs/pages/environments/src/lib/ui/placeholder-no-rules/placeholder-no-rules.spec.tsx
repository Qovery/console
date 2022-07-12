import { render } from '@testing-library/react'

import PlaceholderNoRules from './placeholder-no-rules'

describe('PlaceholderNoRules', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PlaceholderNoRules />)
    expect(baseElement).toBeTruthy()
  })
})
