import { render } from '__tests__/utils/setup-jest'
import LoginCallback from './login-callback'

describe('LoginCallback', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<LoginCallback />)
    expect(baseElement).toBeTruthy()
  })
})
