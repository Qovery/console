import PageRedirectLogin from './page-redirect-login'
import { render } from '__tests__/utils/setup-jest'

describe('PageRedirectLogin', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PageRedirectLogin />)
    expect(baseElement).toBeTruthy()
  })
})
