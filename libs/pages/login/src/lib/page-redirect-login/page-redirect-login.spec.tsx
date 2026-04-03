import { render } from '__tests__/utils/setup-jest'
import PageRedirectLogin from './page-redirect-login'

jest.mock('@elgorditosalsero/react-gtm-hook', () => ({
  ...jest.requireActual('@elgorditosalsero/react-gtm-hook'),
  useGTMDispatch: jest.fn(),
}))

describe('PageRedirectLogin', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PageRedirectLogin />)
    expect(baseElement).toBeTruthy()
  })
})
