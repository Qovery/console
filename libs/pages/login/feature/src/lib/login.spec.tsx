import { render } from '__tests__/utils/setup-jest'

import Login from './login'

describe('Login', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<Login />)
    expect(baseElement).toBeTruthy()
  })
})
