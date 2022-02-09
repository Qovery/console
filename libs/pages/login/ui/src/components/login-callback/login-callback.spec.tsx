import { render } from '@testing-library/react'

import LoginCallback from './login-callback'

describe('LoginCallback', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<LoginCallback />)
    expect(baseElement).toBeTruthy()
  })
})
